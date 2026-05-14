# Nemesis - Book Website

A modern, responsive website for the book "Nemesis" featuring a striking red and black color palette with full PHP/MySQL backend integration.

## 🎨 Design Features

- **Color Palette**: Red (#dc143c) and Black (#000000) theme
- **Typography**: Cinzel for headings, Roboto for body text
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI/UX**: Clean, professional design with smooth animations

## 🚀 Features

### Frontend Features
- **Animated 3D book cover** with floating effects
- **Typing animation** for hero title
- **Parallax scrolling** effects
- **Progress bar** showing scroll position
- **Smooth hover animations** and ripple effects
- **Mobile-responsive** hamburger menu
- **Touch gesture support** for mobile devices

### Backend Features
- **User Authentication** with role-based access (Reader, Author, Editor)
- **Database-driven content** management
- **Pre-order system** with payment simulation
- **Contact form** with email notifications
- **Book management** with characters and chapters
- **Order tracking** and management
- **News/Blog system** with categories
- **Gallery management** for book posters
- **Review and rating** system

### User Roles
- **Reader**: Browse books, place orders, leave reviews
- **Author**: Create and manage books, characters, chapters
- **Editor**: Full access to all features, manage users and content

## 📁 File Structure

```
nemesis/
├── index.html              # Main HTML file
├── styles.css              # CSS styles and animations
├── script.js               # Frontend JavaScript
├── database.sql            # Database schema and setup
├── config/
│   └── database.php        # Database configuration
├── includes/
│   └── functions.php       # Utility functions
├── api/
│   ├── auth.php           # Authentication API
│   ├── books.php          # Books management API
│   ├── orders.php         # Orders and pricing API
│   └── contact.php        # Contact form API
├── uploads/               # File upload directory
├── cache/                 # Cache directory
└── README.md              # Project documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- **XAMPP/WAMP/MAMP** or similar local server
- **PHP 7.4+** with PDO extension
- **MySQL 5.7+** or MariaDB 10.2+
- **Web browser** (Chrome recommended)

### Database Setup

1. **Start your local server** (XAMPP/WAMP/MAMP)
2. **Open phpMyAdmin** (usually http://localhost/phpmyadmin)
3. **Create a new database**:
   - Click "New" in phpMyAdmin
   - Enter database name: `nemesis_db`
   - Click "Create"
4. **Import the database schema**:
   - Select the `nemesis_db` database
   - Click "Import" tab
   - Choose the `database.sql` file
   - Click "Go" to import

### File Setup

1. **Place all files** in your web server directory:
   - For XAMPP: `C:\xampp\htdocs\nemesis\`
   - For WAMP: `C:\wamp\www\nemesis\`
   - For MAMP: `/Applications/MAMP/htdocs/nemesis/`

2. **Set file permissions** (if on Linux/Mac):
   ```bash
   chmod 755 uploads/
   chmod 755 cache/
   chmod 644 *.php
   ```

3. **Configure database connection** (if needed):
   - Edit `config/database.php`
   - Update host, username, password if different from defaults

### Access the Website

1. **Start your web server** (Apache)
2. **Open your browser**
3. **Navigate to**: `http://localhost/nemesis/`

## 🔐 Default Login Credentials

After database setup, you can login with:

- **Email**: `admin@nemesis.com`
- **Password**: `admin123`
- **Role**: Editor

## 📡 API Endpoints

### Authentication API (`/api/auth.php`)

#### Login
```http
POST /api/auth.php?action=login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "reader"
}
```

#### Register
```http
POST /api/auth.php?action=register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "role": "reader"
}
```

#### Check Authentication
```http
GET /api/auth.php?action=check
```

### Books API (`/api/books.php`)

#### Get Books List
```http
GET /api/books.php?action=list&page=1&per_page=10
```

#### Get Book Details
```http
GET /api/books.php?action=details&id=1
```

#### Get Characters
```http
GET /api/books.php?action=characters&book_id=1
```

### Orders API (`/api/orders.php`)

#### Get Pricing
```http
GET /api/orders.php?action=pricing&book_id=1
```

#### Create Order
```http
POST /api/orders.php?action=create
Content-Type: application/json

{
  "book_id": 1,
  "edition_type": "hardcover",
  "quantity": 1,
  "shipping_address": "123 Main St",
  "payment_method": "credit_card"
}
```

### Contact API (`/api/contact.php`)

#### Submit Contact Form
```http
POST /api/contact.php?action=submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

## 🎯 Customization

### Changing Colors
The color scheme is defined in CSS variables at the top of `styles.css`:

```css
:root {
    --primary-red: #dc143c;
    --dark-red: #8b0000;
    --light-red: #ff4444;
    --pure-black: #000000;
    /* ... other colors */
}
```

### Adding Content
- **Book Information**: Update via the database or create admin interface
- **Chapter Details**: Add chapters through the database
- **Author Information**: Update user profiles in the database
- **Contact Details**: Modify settings in the database

### Database Customization
- **Users**: Add new users with different roles
- **Books**: Create multiple books with different pricing
- **Characters**: Add more characters to existing books
- **News**: Create blog posts and announcements

## 📱 Responsive Design

The website is fully responsive and includes:
- **Mobile-first** design approach
- **Hamburger menu** for mobile devices
- **Flexible grid layouts** using CSS Grid and Flexbox
- **Touch-friendly** interactions
- **Optimized typography** for all screen sizes

## 🌟 Animations & Effects

- **Book Cover**: 3D floating animation
- **Typing Effect**: Hero title types out on page load
- **Scroll Animations**: Elements animate as they come into view
- **Hover Effects**: Interactive elements respond to user interaction
- **Parallax**: Background elements move at different speeds
- **Ripple Effects**: Button click animations

## 🔧 Browser Compatibility

- **Chrome** (recommended)
- **Firefox**
- **Safari**
- **Edge**
- **Mobile browsers**

## 🛡️ Security Features

- **Password hashing** using PHP's password_hash()
- **SQL injection protection** with prepared statements
- **XSS protection** with input sanitization
- **CSRF protection** with tokens
- **Session management** with secure cookies
- **Input validation** on all forms

## 📊 Database Schema

### Core Tables
- **users**: User accounts and authentication
- **books**: Book information and metadata
- **characters**: Character profiles and details
- **chapters**: Chapter content and structure
- **orders**: Pre-orders and transactions
- **contact_messages**: Contact form submissions
- **news**: Blog posts and announcements
- **reviews**: User reviews and ratings
- **settings**: System configuration

### Views
- **book_stats**: Aggregated book statistics
- **user_orders**: User order history

## 🚀 Performance Features

- **Database indexing** for fast queries
- **Pagination** for large datasets
- **Caching** for frequently accessed data
- **Optimized images** and assets
- **Minified CSS/JS** for production

## 📄 License

This project is created for the Nemesis book website. Feel free to modify and use as needed.

## 🤝 Support

For any questions or modifications:
1. Check the database schema in `database.sql`
2. Review API endpoints in the `/api/` directory
3. Examine utility functions in `includes/functions.php`
4. Test authentication with the default admin account

## 🔄 Updates and Maintenance

### Regular Tasks
- **Backup database** regularly
- **Update PHP** and dependencies
- **Monitor error logs** for issues
- **Review user feedback** and contact messages
- **Update content** through the database

### Adding New Features
1. **Database**: Add new tables/columns as needed
2. **API**: Create new endpoints in `/api/` directory
3. **Frontend**: Update JavaScript to use new APIs
4. **Styling**: Add CSS for new components

---

**Nemesis** - A tale of vengeance, power, and the ultimate reckoning. 