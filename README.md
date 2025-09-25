# InsightPilot - Smart Dashboard Builder

Turn your data into clear insights with zero data science skills required. InsightPilot automatically analyzes your data and creates beautiful, interactive dashboards with plain English insights.

## Features

- **Multiple Data Sources**: Upload CSV files, enter data manually, or connect Google Forms
- **Automatic Analysis**: Smart field type detection and metric identification
- **Interactive Charts**: Line charts, bar charts, pie charts, and data tables
- **Plain English Insights**: Get business recommendations in simple language
- **Export Options**: Download your dashboard as PDF
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Filtering**: Filter your data to focus on specific segments

## Quick Start

1. **Install Dependencies** (optional, for development server):
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Or simply open `index.html` in your browser.

3. **Upload Your Data**:
   - Drag and drop a CSV file
   - Enter data manually in the text area
   - Or use the sample data provided

4. **Create Your Dashboard**:
   - Select metrics to visualize
   - Choose chart types
   - Generate your dashboard with insights

## Usage

### Step 1: Add Your Data
- **CSV Upload**: Drag and drop or click to browse for CSV files
- **Manual Entry**: Paste data in CSV format (comma-separated values)
- **Google Forms**: Enter a Google Forms response URL (requires backend service)
- **Documents**: Upload Word (.docx) or PDF files (basic support)

### Step 2: Preview Your Data
- View a preview of your data
- See detected field types (text, number, date, boolean)
- Verify data structure before proceeding

### Step 3: Choose Metrics
- Select which fields to visualize
- Metrics are automatically detected (numbers, dates, ratings)
- Choose dimensions for grouping data

### Step 4: Select Chart Types
- Get smart suggestions for each metric
- Choose from line charts, bar charts, pie charts, or data tables
- Mix and match different visualizations

### Step 5: Generate Dashboard
- View summary statistics
- Read plain English business insights
- Use filters to explore different data segments
- Export as PDF or share with others

## File Structure

```
insightpilot/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── app.js             # JavaScript application logic
├── package.json       # Node.js dependencies
└── README.md          # This file
```

## Dependencies

- **Chart.js**: For creating interactive charts
- **PapaParse**: For CSV parsing
- **jsPDF**: For PDF generation
- **html2canvas**: For capturing dashboard screenshots
- **Mammoth**: For Word document processing

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8080
```

### Customization

The app uses CSS custom properties for easy theming. Modify the `:root` variables in `styles.css`:

```css
:root {
  --primary: #0a164d;      /* Main brand color */
  --secondary: #3f37c9;    /* Secondary color */
  --success: #4cc9f0;      /* Success/accent color */
  --light: #f8fbf4;        /* Background color */
  /* ... more variables */
}
```

## API Integration

To enable Google Forms integration, you'll need to implement a backend service that can:
1. Parse Google Forms URLs
2. Fetch response data via Google Forms API
3. Return data in a format the frontend can process

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the browser console for error messages
- Ensure your CSV files are properly formatted
- Try the sample data first to verify functionality

## Roadmap

- [ ] Backend API for Google Forms integration
- [ ] More chart types (scatter plots, heatmaps)
- [ ] Data export options (Excel, JSON)
- [ ] User accounts and saved dashboards
- [ ] Real-time data connections
- [ ] Advanced filtering options
- [ ] Custom themes and branding
