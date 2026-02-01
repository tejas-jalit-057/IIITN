# SAST - Signal Anomaly & Security Tracking

A comprehensive web analytics and security monitoring dashboard for real-time traffic analysis, anomaly detection, and threat intelligence.

## 🚀 Features

### Core Dashboard
- **Overview** - Real-time metrics, RPS timeline, HTTP method distribution
- **Traffic Analysis** - Volume trends, device breakdown, browser statistics
- **Security Monitoring** - Attack detection, threat intelligence, WAF alerts
- **Connectivity** - Internet quality index, speed analysis, latency monitoring
- **Tools** - Data explorer, filtering, report downloads

### Authentication System
- User registration and login
- Bearer token-based sessions
- Role-based access control
- Secure password hashing (bcrypt)

### Analytics Features
- Real-time request monitoring
- AI bot detection and tracking
- Attack pattern analysis
- Performance metrics
- Geographic traffic distribution

## 🛠️ Technology Stack

### Backend
- **PHP 8.2+** - Core application logic
- **MySQL 8.0** - Data storage and analytics
- **PDO** - Database connectivity
- **REST API** - JSON endpoints

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **JavaScript ES6+** - Application logic
- **Chart.js** - Data visualization
- **Responsive Design** - Mobile-first approach

### Database Schema
- 10 optimized tables for analytics data
- Time-series data storage
- User management system
- Session handling

## 📦 Installation

### Prerequisites
- XAMPP/WAMP/MAMP stack
- PHP 8.2+
- MySQL 8.0+
- Web server (Apache/Nginx)

### Setup Instructions

1. **Database Setup**
   ```sql
   mysql -u root < schema.sql
   ```

2. **Configuration**
   - Edit `config.php` with your database credentials
   - Default: `localhost`, `root`, empty password

3. **Start Development Server**
   ```bash
   php -S localhost:8000
   ```

4. **Access Application**
   - Open browser to `http://localhost:8000`
   - Default login: `admin@sast.io` / `analyst@sast.io`

## 🔐 Default Accounts

| Username | Email | Role |
|----------|-------|------|
| admin | admin@sast.io | Administrator |
| analyst | analyst@sast.io | Analyst |

**Note:** Default passwords are hashed. Create new accounts through the registration system.

## 📊 API Endpoints

### Authentication
- `POST /auth.php?action=login` - User login
- `POST /auth.php?action=signup` - User registration
- `POST /auth.php?action=logout` - User logout
- `GET /auth.php?action=check` - Session validation

### Analytics Data
- `GET /api.php?section=overview` - Dashboard metrics
- `GET /api.php?section=traffic` - Traffic analytics
- `GET /api.php?section=security` - Security data
- `GET /api.php?section=connectivity` - Network metrics
- `GET /api.php?section=bots` - Bot activity
- `GET /api.php?section=tools` - Data explorer

## 🎨 UI Features

### Theme System
- Dark/Light mode toggle
- CSS custom properties
- Smooth transitions
- Persistent theme preference

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interface
- Progressive enhancement

### Data Visualization
- 12 Chart.js instances
- Real-time updates
- Interactive charts
- Theme-aware colors

## 🔧 Configuration

### Database Settings (`config.php`)
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'sast_db');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### Session Settings
- 24-hour token expiration
- Secure token generation
- Automatic cleanup

## 📈 Monitoring Capabilities

### Traffic Metrics
- Requests per second (RPS)
- HTTP method distribution
- Device type breakdown
- Geographic distribution
- Protocol usage statistics

### Security Features
- Application layer attack detection
- Network layer monitoring
- Bot activity tracking
- AI crawler identification
- Threat intelligence feeds

### Performance Monitoring
- Internet Quality Index
- Speed test integration
- Latency analysis
- Regional performance data

## 🚀 Deployment

### Production Considerations
- Enable HTTPS
- Configure firewall rules
- Set up database backups
- Monitor resource usage
- Implement rate limiting

### Security Best Practices
- Regular password updates
- Session timeout configuration
- Input validation
- SQL injection prevention
- XSS protection

## 📝 Development

### File Structure
```
SAST/
├── index.html          # Main dashboard
├── api.php            # Analytics API
├── auth.php           # Authentication
├── config.php         # Database config
├── app.js             # Frontend logic
├── style.css          # Styling
├── schema.sql         # Database schema
└── README.md          # Documentation
```

### Adding New Features
1. Create API endpoint in `api.php`
2. Add frontend logic in `app.js`
3. Update database schema if needed
4. Add UI components in `index.html`
5. Style with `style.css`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review error logs
- Test API endpoints
- Verify database connectivity

---

**SAST** - Signal Anomaly & Security Tracking  
Real-time analytics for modern web applications
