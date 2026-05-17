# Leave Management System

A comprehensive leave management application built to streamline employee time-off requests, approvals, and tracking.

## Overview

The Leave Management System is a full-stack application designed to simplify the process of managing employee leave requests. It provides an intuitive interface for employees to submit leave requests and enables managers to review, approve, or deny requests efficiently. The system maintains detailed records of leave balances, history, and usage patterns.

## Features

- **Employee Leave Requests**: Submit and track leave requests with multiple leave types
- **Manager Dashboard**: Review and manage pending leave requests with an intuitive interface
- **Leave Balance Tracking**: Real-time visibility into available leave days by category
- **Leave History**: Comprehensive audit trail of all leave requests and approvals
- **Notifications**: Automatic notifications for request submissions, approvals, and rejections
- **Reporting**: Generate leave reports for compliance and HR analysis
- **User Management**: Role-based access control for employees and managers

## Tech Stack

### Frontend
- **JavaScript** (63.7%) - Core application logic and interactivity
- **HTML** (0.1%) - Markup structure
- **CSS** (1.6%) - Styling and responsive design

### Backend
- **Python** (34.6%) - Backend API and business logic

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip package manager
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/timovibes/leavemanagement.git
   cd leavemanagement
   ```

2. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database**
   ```bash
   python manage.py migrate
   ```

6. **Start the development server**
   ```bash
   # Terminal 1 - Backend
   python manage.py runserver
   
   # Terminal 2 - Frontend
   npm start
   ```

The application will be available at `http://localhost:3000`

## Usage

### For Employees
1. Log in with your credentials
2. Navigate to "Request Leave"
3. Select leave type, start date, and end date
4. Add optional comments and submit
5. Monitor request status in your dashboard

### For Managers
1. Log in with manager credentials
2. View pending requests on the dashboard
3. Review request details and employee information
4. Approve or reject requests with optional feedback
5. Access reports for leave analytics

## Project Structure

```
leavemanagement/
├── frontend/           # React/JavaScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # Python backend
│   ├── app/
│   ├── migrations/
│   ├── requirements.txt
│   └── manage.py
├── README.md
└── .gitignore
```

## API Documentation

The backend provides RESTful API endpoints for:
- Authentication and user management
- Leave request CRUD operations
- Leave balance queries
- Approval workflows
- Reporting and analytics

For detailed API documentation, refer to the API documentation file or visit `/api/docs` in the running application.

## Configuration

Key environment variables to configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Debug mode (development only) |
| `ALLOWED_HOSTS` | Allowed host domains |
| `REACT_APP_API_URL` | Backend API URL |

## Testing

### Run Backend Tests
```bash
python manage.py test
```

### Run Frontend Tests
```bash
npm test
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please:

- Open a [GitHub Issue](https://github.com/timovibes/leavemanagement/issues)
- Check existing documentation in the repository
- Contact the development team

## Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for a detailed history of changes and releases.

## Roadmap

- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced reporting and analytics
- [ ] Integration with HR systems
- [ ] Automated approval workflows
- [ ] Leave type customization

## Acknowledgments

- All contributors and maintainers
- Community feedback and suggestions
- Open-source libraries and frameworks used in this project

---

**Last Updated**: May 2026

For more information, visit our [GitHub repository](https://github.com/timovibes/leavemanagement)
