# 🏠 HomeBoss

> A futuristic smart home automation system built by **Optimus Technologies**

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-active-success)

## 🌟 Overview

**HomeBoss** is an intelligent home automation system that empowers users to control lighting, doors, and security from anywhere using a mobile app. This landing page serves as the primary web presence to attract investors and customers.

### ✨ Key Features

- 🎨 **Modern, Futuristic Design** - Electric blue theme with smooth animations
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- ⚡ **Interactive Elements** - Scroll animations, hover effects, and dynamic counters
- 📝 **Waitlist Integration** - Formspree-powered customer and investor sign-ups
- 🔍 **SEO Optimized** - Semantic HTML and comprehensive meta tags
- 🚀 **Fast Performance** - Optimized assets and lazy loading

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express |
| **Typography** | Google Fonts (Orbitron, Poppins) |
| **Forms** | Formspree |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
homeboss/
├── public/
│   ├── index.html          # Main landing page
│   ├── about.html          # About Optimus Technologies
│   ├── styles.css          # All styling
│   └── script.js           # Interactive JavaScript
├── server.js               # Express server
├── package.json            # Dependencies
├── README.md               # Documentation
└── vercel.json             # Vercel configuration (optional)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd homeboss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Development Mode

For auto-reload during development:
```bash
npm run dev
```

---

## 📧 Formspree Configuration

### Current Setup

The website uses placeholder Formspree endpoints:
- **Customer Waitlist**: `https://formspree.io/f/customer_waitlist`
- **Investor Waitlist**: `https://formspree.io/f/investor_waitlist`

### How to Update

1. Create a [Formspree account](https://formspree.io)
2. Create two forms (one for customers, one for investors)
3. Get your form IDs (format: `xyzabc123`)
4. Update `public/index.html` (around line 170):
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" class="waitlist-form" id="waitlist-form">
   ```
5. Update `public/script.js` (around line 95):
   ```javascript
   if (role === 'investor') {
       form.action = 'https://formspree.io/f/YOUR_INVESTOR_FORM_ID';
   } else {
       form.action = 'https://formspree.io/f/YOUR_CUSTOMER_FORM_ID';
   }
   ```

---

## 🌐 Deployment

### Deploy to Vercel (CLI)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Deploy to Vercel (Dashboard)

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Click **"Deploy"**

### Environment Variables

If needed, add environment variables in your Vercel project settings under **Environment Variables**.

---

## 🎨 Customization

### Change Colors

Edit `public/styles.css` (around line 15):

```css
:root {
    --primary-blue: #007BFF;    /* Main brand color */
    --silver: #C0C0C0;          /* Secondary text */
    --dark-navy: #0A0A0A;       /* Background */
    --white: #FFFFFF;           /* Text color */
}
```

### Update Content

- **Hero Text**: Edit `public/index.html` (around line 40)
- **Features**: Edit `public/index.html` (around line 65)
- **About Page**: Edit `public/about.html`

### Add Social Links

Update footer in both HTML files:

```html
<a href="YOUR_LINKEDIN_URL" aria-label="LinkedIn">📎</a>
<a href="YOUR_INSTAGRAM_URL" aria-label="Instagram">📷</a>
<a href="YOUR_TWITTER_URL" aria-label="Twitter">🐦</a>
```

---

## 📊 Analytics

The website includes a simple session-based visitor counter. For production:

- **Google Analytics** - Add tracking code to HTML files
- **Plausible/Fathom** - Privacy-focused analytics
- **Custom Backend** - Use the `/api/analytics` endpoint

---

## 🔧 Troubleshooting

### Forms not submitting?
- ✅ Check Formspree endpoints are correct
- ✅ Ensure internet connection is active
- ✅ Check browser console for errors

### Styles not loading?
- ✅ Verify file paths in HTML
- ✅ Check that CSS file is in `public/` folder
- ✅ Clear browser cache

### Server won't start?
- ✅ Ensure Node.js is installed (`node --version`)
- ✅ Run `npm install` again
- ✅ Check if port 3000 is available

---

## 📝 Roadmap

- [ ] Add actual demo video
- [ ] Implement real analytics dashboard
- [ ] Add blog section for content marketing
- [ ] Create investor pitch deck download
- [ ] Integrate with CRM system
- [ ] Add live chat support
- [ ] Multi-language support

---

## 👨‍💻 Team

**Created by Optimus Technologies**

- **Founder**: Osborn Nartey
- **Project**: HomeBoss Smart Home System
- **Year**: 2025

---

## 📄 License

Copyright © 2025 Optimus Technologies. All rights reserved.

---

## 💬 Support

For questions or support:

- 📧 **Email**: contact@optimustech.com *(update with real email)*
- 🌐 **Website**: Join our waitlist

---

## 🙏 Acknowledgments

- [Google Fonts](https://fonts.google.com/) for typography
- [Formspree](https://formspree.io/) for form handling
- [Vercel](https://vercel.com/) for hosting

---

<div align="center">
  
**Built with ❤️ for a smarter future**

[⬆ Back to Top](#-homeboss)

</div>
