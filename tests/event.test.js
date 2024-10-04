const request = require('supertest');
const app = require('../app')

// /POST initialize an event, name and totalTickets required
describe('POST /initialize', ()=>{
    it('should initialize a new event with given number of tickets', async ()=>{
        const res = await request(app)
        .post('/api/events/initialize')
        .send({ eventName: 'comedy', totalTickets: 100 });

        expect(res.statusCode).toEqual(200)
        expect(res.body.message).toBe('Event initialized successfully');
        
         
        expect(res.body.event.totalTickets).toBe(100);
        expect(res.body.event.availableTickets).toBe(100)
    })
})

// /POST book an event and add user to wait list if fully booked
describe('/POST book', ()=>{
    it('should book a ticket successfully when available', async () => {
        const res = await request(app)
        .post('/api/events/book')
        .send({ userId: 1 , eventId: 1 });
      
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Ticket booked successfully');
        
    });

    // /POST waiting 
    it('should add user when no ticket is available but with waiting status', async ()=>{
        // Initialize an event with 1 ticket
        await request(app)
            .post('/api/events/initialize')
            .send({ eventName:'conference', totalTickets: 1 });

        // Book the only available ticket
        await request(app)
            .post('/api/events/book')
            .send({ userId: 2 , eventId: 2 });

        // Attempt to book ticket again, user should be add on to the waiting list
        const res = await request(app)
            .post('/api/events/book')
            .send({ userId: 3, eventId: 2 });


        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('No tickets available, added to waiting list');
    } )
      
})

// /POST cancel booked ticket and add waiting user to booked 
describe('/POST cancel',  ()=>{
    it('it should cancel booked ticket and assign to waiting user', async ()=>{
        const res = await request(app)
        .post('/api/events/cancel')
        .send({ userId: 3, eventId: 2 })

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Booking canceled and updated successfully');
    })
} )
