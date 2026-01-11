# Simple Stripe Graph

A minimal, Notion-inspired dashboard for visualizing Stripe revenue metrics including MRR, Total Revenue, and monthly breakdowns.

## Features

- 📊 **Real-time Stripe Data**: Displays actual revenue metrics from your Stripe account
- 🎨 **Clean Design**: Notion-inspired minimalist interface with dark mode support
- 📈 **Multiple Metrics**: View MRR, Total Revenue, and current month's daily revenue
- ⚡ **Fast & Responsive**: Built with React and Vite for optimal performance

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stripe

1. **Create a Restricted API Key** from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Click "Create restricted key"
   - Name it (e.g., "Revenue Dashboard - Read Only")
   - Grant **Read** permissions for:
     - `Charges`
     - `Subscriptions`
   - All other permissions should remain "None"
   - Click "Create key"

2. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

3. Add your restricted key to `.env`:

```
VITE_STRIPE_SECRET_KEY=rk_test_your_restricted_key_here
```

⚠️ **Security Notes**: 
- Use a **restricted key** with read-only permissions (not a full secret key)
- Never commit your `.env` file to version control (`.gitignore` is configured to exclude it)
- For production, implement a backend API instead of exposing keys in the frontend

### 3. Run the Development Server

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

### View Different Metrics

Click on any of the three metric buttons to switch between:
- **MRR**: Monthly Recurring Revenue (last 12 months)
- **Total Revenue**: Cumulative revenue over time (last 12 months)
- **This Month**: Daily revenue breakdown for the current month

## How It Works

The application connects to Stripe's API to fetch:
1. **Subscriptions** for MRR calculations
2. **Charges** for total revenue and daily revenue
3. Real-time data that updates each time you load the dashboard

## Technologies

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Recharts**: Chart visualization
- **Stripe SDK**: Payment data integration
- **Tailwind CSS**: Styling (via inline classes)

## Project Structure

```
├── components/
│   ├── Dashboard.tsx      # Main dashboard component
│   └── RevenueChart.tsx   # Chart visualization
├── services/
│   └── stripeService.ts   # Stripe API integration
├── constants.ts           # Demo data
├── types.ts              # TypeScript types
└── App.tsx               # Root component
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

⚠️ **Important**: This app uses Stripe secret keys which should only be used in secure backend environments. For production use, implement a backend API that securely calls Stripe and returns data to your frontend.

## License

MIT