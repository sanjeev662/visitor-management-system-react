## Description

Welcome to the Visitor Management System (VMS)! Our system is designed to simplify and enhance the visitor registration and management process for various environments, including offices, buildings, or events. With a user-friendly interface and role-based access control, VMS offers administrators, receptionists, and guards the tools they need to efficiently manage visitor traffic while ensuring security and compliance.

## Features

- **Comprehensive Dashboard**: Gain insights into visitor traffic with detailed charts and statistics, including monthly visits, day-wise trends, zone-wise distribution, and recent visitor details.

- **Role-Based Access Control**: Administrators, receptionists, and guards each have specific roles with tailored access to features, ensuring smooth operation and security compliance.

### Admin Role:

- **Full Access**: Administrators have full access to all functionalities
- **Dashboard**: Dashboard with charts showing details about monthly visits, day-wise statistics, zone-wise distribution, and recent visitor details.
- **User Management**: Create, update, delete, and retrieve all users with filters and pagination.
- **Visitor Management**: Create, update, delete, and retrieve all visitors with filters and pagination.
- **Pass Management**: Generate passes for visitors with printing functionality, assign RFID keys for access control.
- **FAQ Section**: Provide answers to frequently asked questions about how to use VMS.
- **Modify Gadget Configuration**: Configure settings for five hardware gadgets with all operations.


### Receptionist Role:

- **Limited Access**: Receptionists have access to specific functionalities.
- **Dashboard**: View charts showing details about monthly visits, day-wise statistics, zone-wise distribution, and recent visitor details.
- **Visitor Management**: Create, update, delete, and retrieve all visitors with filters and pagination, with the ability to blacklist visitors.
- **Pass Management**: Generate passes for visitors, assign RFID keys, and provide printing functionality.
- **Reports**: View and generate reports for users, such as login-logout, visitor visits, and gadget configuration modifications, with validations.
- **FAQ Section**: Provide answers to frequently asked questions about how to use VMS.

#### Guard Role:

- **Limited Access**: Guards have access to specific functionalities.
- **Visitor Verification**: Verify if the current visitor has a valid pass,show alert if invalid or blacklisted visitor.
- **Recent Visitors**: View the top 5 recent visitors for monitoring purposes.

### Technology Used

- **React**: A powerful JavaScript library for building user interfaces.
- **Material UI**: A popular React component library for creating beautiful and responsive UI designs.
- **Tailwind CSS**: A utility-first CSS framework for building custom designs with ease.

### Additional Features

- **Step-Form**: Implement a step-by-step form for smoother visitor registration, with progress bars and model view.
- **Webcam Integration**: Capture visitor images during registration using the react-webcam library.
- **Signature Integration**: Integrate SignoTech for capturing visitor signatures during registration.
- **Routing**: Implement routing for a seamless user experience and easy navigation within the system.
- **Models**: Use models for showing details or creating forms.
- **Pagination and Searching**: Implement frontend as well as backend pagination and searching techniques for fast response.
