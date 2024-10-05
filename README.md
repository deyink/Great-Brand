# Event Ticket Booking API

This is an event ticket booking API that provides endpoints for initializing events, booking tickets, handling cancellations, managing a waiting list, and retrieving the event's status. The API is designed with concurrency in mind, ensuring thread-safety, and also includes rate-limiting, basic authentication for sensitive operations, and logging to track operations.

## Features
- Initialize events with available tickets.
- Book tickets for events with automatic waiting list management when sold out.
- Cancel bookings with automatic ticket assignment to waiting list users.
- Retrieve event status including available tickets and waiting list.
- Rate limiting to protect the API from abuse.
- Basic authentication for sensitive operations.
- Logging system for operational tracking.

## Setup and Running Instructions

### Prerequisites
- **Node.js**: Ensure Node.js is installed on your machine.
- **MySQL**: A running MySQL instance for the database.

### Installation Steps
1. **Clone the repository:**
   git clone <repository-url>
   cd event-booking-system

2. **Install dependencies:**
    npm install

3. **Configure the database:**
Copy the configuration template:
cp config/config.example.json config/config.json
Edit the config/config.json file to add your MySQL credentials.

4. **Run database migrations to set up the schema:**
npx sequelize-cli db:migrate

5. **Start the server:**
npm start

6. **Running tests:**
To run the test suite:
npm test


## Environment Variables
- PORT: Port to run the server (default: 3000).
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME: MySQL connection details.

## Brief Explanation of Design Choices

### Concurrency Handling:
The booking and cancellation processes are built with race conditions in mind. Transactions are used with table locking to ensure atomicity, especially when dealing with limited ticket availability.

### In-memory Data Complement:
In addition to the MySQL database, in-memory data structures are used to manage transient data like the waiting list. This ensures fast access but does not replace the persistence layer, you can see our in-memory cache here **http://localhost:3000/api/events/debug/cache**

### Basic Authentication:
Sensitive operations (such as get events status and waiting-list total ) are protected using basic authentication to ensure only authorized users can perform such actions.

### Logging:
A logging system tracks important events (such as bookings and cancellations) and writes them to a log file for operational transparency, you will find this file in logs.

## Rate Limiting
- The API has rate-limiting applied to prevent excessive requests from a single IP. By default, the limit is set to 5 requests per 15 minutes per IP.

## Authentication
Basic authentication is required for sensitive endpoints. it is implemeneted for get even status end point The username and password can be configured in the environment variables.

## API Documentation
1. **POST /api/events/initialize**
- Initializes a new event with a specified number of tickets.
Request Body sample:
{
  "eventName": "conference",
  "totalTickets": 100
}
- Response:
- 201 Created: Returns the newly created event with its id.

2. **POST /api/events/book**
- Books a ticket for a user. If tickets are sold out, the user is added to a waiting list.
Request Body sample:
{
  "userId": 1,
  "eventId": 10
}
Responses:
201 Created: Successfully booked a ticket.
201 Created: No tickets available, added to the waiting list.

3. **POST /api/events/cancel**
-Cancels a booking for a user. If there's a waiting list, the next user is automatically assigned the ticket.
Request Body sample:
{
  "userId": 1,
  "eventId": 10
}
Response:
200 OK: Booking canceled and next user from the waiting list booked.

4. **GET /api/events/status/**
- Retrieves the current status of an event including available tickets and the count of users in the waiting list.
this route is authenticated:
username: admin
password: greatbrands

response sample
{
  "eventId": 10,
  "eventName": "conference",
  "availableTickets": 50,
  "waitingListCount": 5
}