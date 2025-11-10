# Research Platform

A unified web application that combines PhD Graduate Search and University Comparison Dashboard functionality, built with React, TypeScript, and Vite.

## 🚀 Features

### 📚 PhD Graduate Search
- **Advanced Search & Filtering**: Search PhD graduates by university, graduation year, citation count, and research topics
- **Interactive University List**: Browse candidates organized by university with real-time filtering
- **Detailed Candidate Profiles**: View comprehensive profiles including research interests, publications, and academic achievements
- **AI-Powered Chat**: Ask questions about candidates using GPT-powered chat with context-aware responses
- **Percentile Filtering**: Filter candidates by top percentile performance (top 1%, 5%, 10%, etc.)
- **Real-time Search**: Instant filtering as you type with preserved selection state

### 🏛️ University Comparison Dashboard
- **Multi-University Analysis**: Compare academic output and research performance across multiple universities
- **Interactive Visualizations**: 
  - Academic output charts showing publication trends
  - Conference distribution analysis
  - Keyword heatmaps for research focus areas
  - Emerging topics identification
- **Time Period Selection**: Analyze data across different time periods (2020-2024, etc.)
- **Dynamic University Management**: Add/remove universities from comparison with real-time updates

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **AI Integration**: OpenAI GPT API for chat functionality
- **State Management**: React hooks (useState, useEffect, useCallback)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd research-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your OpenAI API key:
   ```bash
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   **Note**: You can get an API key from [OpenAI](https://platform.openai.com/api-keys). The chat feature requires this key to function.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in your terminal)

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Radix UI components (buttons, cards, etc.)
│   ├── figma/           # Figma-specific components
│   ├── SearchInterface.tsx
│   ├── UniversityList.tsx
│   ├── CandidateProfile.tsx
│   ├── UniversityInput.tsx
│   ├── AcademicOutputChart.tsx
│   └── ...              # Other feature components
├── pages/               # Main page components
│   ├── PhDGraduateSearch.tsx
│   └── UniversityComparison.tsx
├── data/                # Mock data for PhD graduate search
│   └── mockData.ts
├── utils/               # Utility functions and mock data
│   └── mockData.ts
├── styles/              # Global styles
│   └── globals.css
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## 🎯 Usage

### PhD Graduate Search
1. Use the search bar to find specific candidates or universities
2. Adjust filters for graduation year, minimum citations, and research topics
3. Select a view mode (by university or by candidate)
4. Use percentile filtering to focus on top performers
5. Click on any candidate to view their detailed profile

### University Comparison
1. Add universities to compare using the input field
2. Select a time period for analysis
3. View interactive charts showing:
   - Academic output trends
   - Conference distribution
   - Research keyword heatmaps
   - Emerging topics analysis
4. Remove universities from comparison as needed

## 🎨 Design

The application features a modern, clean interface with:
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme Support**: Built with next-themes integration
- **Accessible Components**: All UI components follow accessibility best practices
- **Smooth Animations**: Subtle transitions and hover effects for better UX

## 📊 Data

The application currently uses mock data for demonstration purposes:
- **PhD Graduate Data**: Includes universities, candidates, publications, and research topics
- **University Comparison Data**: Generated academic metrics, conference data, and research trends

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag and drop the `build/` folder to Netlify
3. Configure redirects for SPA routing if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project merges two original Figma designs:
- **PhD Graduate Search Page**: [Original Design](https://www.figma.com/design/YpMf7uDyY2i3ShM4sOQPLB/PhD-Graduate-Search-Page)
- **University Comparison Dashboard**: [Original Design](https://www.figma.com/design/VzTgHB8JMmTpPS3bwU3oej/University-Comparison-Dashboard)

## 📞 Support

If you have any questions or need help with the project, please:
- Open an issue on GitHub
- Check the existing issues for similar problems
- Review the code documentation

---

**Built with ❤️ using React, TypeScript, and modern web technologies**