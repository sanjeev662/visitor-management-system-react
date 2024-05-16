## Features

### Admin Role:

- Full access to all functionalities.
- Dashboard with charts showing details about monthly visits, day-wise statistics, zone-wise distribution, and recent visitor details.
- User management (create, update, delete, get all users with filters and pagination).
- Visitor management (create, update, delete, get all visitors with filters and pagination).
- Pass management (generate passes for visitors with printing functionality, assign RFID keys).
- FAQ (frequently asked questions for how to use VMS).
- Modify gadget configuration (includes configuration settings for five hardware gadgets with all operations).

### Receptionist Role:

- Access to limited functionalities.
- Dashboard with charts showing details about monthly visits, day-wise statistics, zone-wise distribution, and recent visitor details.
- Visitor management (create, update, delete, get all visitors with filters and pagination, ability to blacklist visitors).
- Pass management (generate passes for visitors, assign RFID keys, with printing functionality).
- Reports (view and generate reports for users, such as login-logout, visitor visits, and gadget configuration modifications, with validations).
- FAQ (frequently asked questions for how to use VMS).

### Guard Role:

- Access to limited functionalities.
- Verify if the current visitor has a valid pass or not.
- View top 5 recent visitors.

## Technology Used

- React
- Material UI
- Tailwind CSS

## Additional Features

- Created step-form (with progress bars).
- Used react-webcam library for image capture during visitor registration.
- Integrated SignoTech for signature purpose during visitor registration.
- Implemented routing for better user experience.
- Used models for showing details or creating forms.
- Implemented frontend as well as backend pagination and searching techniques for fast response.
