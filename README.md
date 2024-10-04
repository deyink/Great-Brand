Event Ticket Booking API
This is an event ticket booking API that provides endpoints for initializing events, booking tickets, handling cancellations, managing a waiting list, and retrieving the event's status. The API is designed with concurrency in mind, ensuring thread-safety, and also includes rate-limiting, basic authentication for sensitive operations, and logging to track operations.

Features
Initialize events with available tickets.
Book tickets for events with automatic waiting list management when sold out.
Cancel bookings with automatic ticket assignment to waiting list users.
Retrieve event status including available tickets and waiting list.
Rate limiting to protect the API from abuse.
Basic authentication for sensitive operations.
Logging system for operational tracking.
Setup and Running Instructions
Prerequisites
Node.js: Ensure Node.js is installed on your machine.
MySQL: A running MySQL instance for the database.
Installation Steps
Clone the repository:

bash
Copy code
git clone <repository-url>
cd event-booking-system
Install dependencies:

bash
Copy code
npm install
Configure the database:

Copy the configuration template:
bash
Copy code
cp config/config.example.json config/config.json
Edit the config/config.json file to add your MySQL credentials.
Run database migrations to set up the schema:

bash
Copy code
npx sequelize-cli db:migrate
Start the server:

bash
Copy code
npm start
Running tests:

To run the test suite:
bash
Copy code
npm test
Environment Variables
PORT: Port to run the server (default: 3000).
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME: MySQL connection details.
Brief Explanation of Design Choices
Concurrency Handling:

The booking and cancellation processes are built with race conditions in mind. Transactions are used with table locking to ensure atomicity, particularly when dealing with limited ticket availability.
In-memory Data Complement:

In addition to the MySQL database, in-memory data structures are used to manage transient data like the waiting list. This ensures fast access but does not replace the persistence layer.
Rate Limiting:

Implemented using express-rate-limit to prevent abuse of the booking system by limiting the number of requests from a single IP.
Basic Authentication:

Sensitive operations (such as initializing events) are protected using basic authentication to ensure only authorized users can perform such actions.
Logging:

A logging system tracks important events (such as bookings and cancellations) and writes them to a log file for operational transparency.
API Documentation
1. POST /api/events/initialize
Initializes a new event with a specified number of tickets.
Request Body:
json
Copy code
{
  "eventName": "conference",
  "totalTickets": 100
}
Response:
201 Created: Returns the newly created event with its id.
2. POST /api/events/book
Books a ticket for a user. If tickets are sold out, the user is added to a waiting list.
Request Body:
json
Copy code
{
  "userId": 1,
  "eventId": 10
}
Responses:
201 Created: Successfully booked a ticket.
201 Created: No tickets available, added to the waiting list.
3. POST /api/events/cancel
Cancels a booking for a user. If there's a waiting list, the next user is automatically assigned the ticket.
Request Body:
json
Copy code
{
  "userId": 1,
  "eventId": 10
}
Response:
200 OK: Booking canceled and next user from the waiting list booked.
4. GET /api/events/status/
Retrieves the current status of an event including available tickets and the count of users in the waiting list.
Response:
json
Copy code
{
  "eventId": 10,
  "eventName": "conference",
  "availableTickets": 50,
  "waitingListCount": 5
}
Rate Limiting
The API has rate-limiting applied to prevent excessive requests from a single IP. By default, the limit is set to 100 requests per 15 minutes per IP.

Authentication
Basic authentication is required for sensitive endpoints such as event initialization. The username and password can be configured in the environment variables."# Great-Brands" 
