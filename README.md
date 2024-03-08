# Fillout Test Assessment
Our API provides a single endpoint to fetch and filter form submissions. It extends the functionality of Fillout.com's standard form responses endpoint by allowing clients to specify filters

## Get Started
1. Install dependencies: `npm i`
2. Add the `.env` file and add a variable: `FILL_OUT_API_KEY`
3. Run `npm run dev`

## Linting

- `npm run lint` - checks for eslint, prettier, and TS errors
- `npm run lint:fix` -  automatically fixes code according to eslint rules
- `npm run tsc` - runs types check

CI/CD pipeline automatically runs linter checks on push.
