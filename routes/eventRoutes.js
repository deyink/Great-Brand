const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const sequelize = require('../config');
const { logEvent } = require('../loggers');
const authenticate = require('../auth');
const limiter = require('../rate-limit');

const router = express.Router();

// in-memory data cache
const eventCache = new Map();

// Initialize Event
router.post('/initialize', limiter, async (req, res)=>{
  const { eventName, totalTickets } = req.body;

    try {
        const event = await Event.create({
            eventName,
            totalTickets,
            availableTickets: totalTickets,
        });

        // in-memory cahe update
        eventCache.set(event.id,{
            eventName: event.eventName,
            totalTickets:event.totalTickets,
            availableTickets: event.availableTickets,   
        })

        res.status(200).json({ message: 'Event initialized successfully', event })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

// book a ticket 
router.post('/book', async (req, res)=>{
    const { userId, eventId } = req.body;

    // Start a transaction
    const t = await sequelize.transaction();

    if (!userId || !eventId) {
        return res.status(400).json({ error: 'Missing required fields: userId, eventId' });
    }

    try {
        const event = await Event.findByPk(eventId, {lock: true, transaction: t } );

        if (!event) {
            console.log('Event not found with ID:', eventId);  // Log this to debug

            await t.rollback()
            return res.status(404).json({ message: 'Event not found' });
        }
        
          // book logging
          logEvent (`User ${req.body.userId} booked a ticket for Event ${req.body.eventId}`);

        try{
        // Optimistic locking will check if the version matches when saving
            if (event.availableTickets > 0){
                // Book ticket
                await Booking.create({ userId, eventId, status: 'booked' }, { transaction: t });

                // reduce ticket available
                event.availableTickets -= 1;
                await event.save({transaction:t});

                // update in-memory
                const eventStatus = eventCache.get(eventId);
                if(eventStatus){
                    eventStatus.availableTickets = event.availableTickets;
                    eventCache.set(eventId, eventStatus);
                }

               
                await t.commit();
                res.status(200).json({ message: 'Ticket booked successfully' });
            } else {
                // waiting list
                await Booking.create({ userId, eventId, status: 'waiting' }, {transaction: t });

                 // Update in-memory 
                const eventStatus = eventCache.get(eventId);
                if (eventStatus) {
                eventStatus.waitingList.push(userId);
                eventCache.set(eventId, eventStatus);
                }

                await event.save({transaction:t})
                await t.commit();

                res.status(201).json({ message: 'No tickets available, added to waiting list' });
            }
        } catch (error) {
            await t.rollback();
            throw error;  // Handle error gracefully
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel a booking
router.post('/cancel' , async (req, res) => {
    const { userId, eventId } = req.body;
  
    try {
        const booking = await Booking.findOne({ where: { userId, eventId, status: 'booked' } });
    
        if (!booking) {
            await t.rollback()
            return res.status(404).json({ message: 'Booking is not found' });
        }

        const event = await Event.findByPk(eventId);

        if (!event) {
            await t.rollback()
            return res.status(404).json({ message: 'Event not found' });
        }
  
      const t = await sequelize.transaction();

        try {
            await booking.destroy( { transaction: t } );
        
            // Check if there is a waiting list
            const waitingUser = await Booking.findOne({ where: { 
              eventId, status: 'waiting' },
            order: [['createdAt', 'ASC']],  // first user who joined the waiting list
            transaction: t,
            });
        
            if (waitingUser) {
                waitingUser.status = 'booked';
                await waitingUser.save({transaction:t});
            } else {
                const event = await Event.findByPk(eventId);
                event.availableTickets += 1;
                await event.save({ transaction: t });
            }   

            // Update in-memory 
            const eventStatus = eventCache.get(eventId);
            if (eventStatus) {
                if (waitingUser) {
                eventStatus.waitingList.shift();  // Remove the user from the waiting list
                } else {
                eventStatus.availableTickets = event.availableTickets;
                }
                eventCache.set(eventId, eventStatus);
            }

            await t.commit();
            res.status(200).json({ message: 'Booking canceled and updated successfully' });  
        } catch (error){
            await t.rollback();
            throw error;
        }

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get event status
  router.get('/status/:eventId', authenticate, async (req, res) => {
    
    const { eventId } = req.params;

    // check if event status is cached
    const cachedEvent = eventCache.get(eventId)

    if(cachedEvent){
        return res.status(200).json({
            availableTickets: cachedEvent.availableTickets,
            waitingListCount: cachedEvent.waitingList.length,
            waitingList: cachedEvent.waitingList,
        })
    }

    // if not cached
    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        // fetch waiting from db
        const waitingList = await getWaitingListForEvent(eventId);
        const waitingListCount = waitingList.length;

         // Cache the event status, including the waiting list
        eventCache.set(eventId, {
        availableTickets: event.availableTickets,
        waitingList: waitingList,
        });
  
  
        // const waitingListCount = await Booking.count({ where: { eventId, status: 'waiting' } });

        res.status(200).json({
            availableTickets: event.availableTickets,
            waitingList: waitingList,
            waitingListCount,

        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Debugging endpoint to view the in-memory cache
router.get('/debug/cache', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Access forbidden in production' });
    }

    const cacheData = [];
  
    eventCache.forEach((value, key) => {
      cacheData.push({
        eventId: key,
        eventName: value.eventName,
        availableTickets: value.availableTickets,
        waitingList: value.waitingList,
      });
    });
  
    res.status(200).json({
      cache: cacheData,
    });
  });
  
  const getWaitingListForEvent = async (eventId) => {
    try {
      // Find all users in the waiting list for the given event
      const waitingList = await Booking.findAll({
        where: {
          eventId: eventId,
          status: 'waiting',
        },
        order: [['createdAt', 'ASC']],  // Ensures the waiting list is in order of who joined first
      });
  
      return waitingList.map((booking) => booking.userId);  // Extract and return only the user IDs
    } catch (error) {
      console.error('Error fetching waiting list:', error);
      throw error;
    }
  };
  

  
  module.exports = router;