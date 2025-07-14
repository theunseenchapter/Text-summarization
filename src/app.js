import './styles.css'

// AI Summarizer Application
class TextSummarizer {
  constructor() {
    this.currentMethod = 'extractive';
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.initializeApp();
  }

  initializeApp() {
    this.setupTheme();
    this.setupEventListeners();
    this.setupSmoothScrolling();
  }

  setupTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      const icon = document.querySelector('#themeToggle i');
      if (icon) {
        icon.className = 'fas fa-sun text-gray-700 dark:text-gray-200';
      }
    }
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Get started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', () => {
        document.getElementById('summarizer').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Input method toggles
    const textInputBtn = document.getElementById('textInputBtn');
    const fileUploadBtn = document.getElementById('fileUploadBtn');
    
    if (textInputBtn) {
      textInputBtn.addEventListener('click', () => this.toggleInputMethod('text'));
    }
    if (fileUploadBtn) {
      fileUploadBtn.addEventListener('click', () => this.toggleInputMethod('file'));
    }

    // File upload
    const browseBtn = document.getElementById('browseBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Summarization method
    const methodRadios = document.querySelectorAll('input[name="method"]');
    methodRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentMethod = e.target.value;
      });
    });

    // Summarize button
    const summarizeBtn = document.getElementById('summarizeBtn');
    if (summarizeBtn) {
      summarizeBtn.addEventListener('click', () => this.summarizeText());
    }

    // Results tabs
    const summaryTab = document.getElementById('summaryTab');
    const metricsTab = document.getElementById('metricsTab');
    
    if (summaryTab) {
      summaryTab.addEventListener('click', () => this.showTab('summary'));
    }
    if (metricsTab) {
      metricsTab.addEventListener('click', () => this.showTab('metrics'));
    }

    // Action buttons
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copySummary());
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadSummary());
    }
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareSummary());
    }
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', this.isDarkMode);
    
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
      icon.className = this.isDarkMode 
        ? 'fas fa-sun text-gray-700 dark:text-gray-200'
        : 'fas fa-moon text-gray-700 dark:text-gray-200';
    }
  }

  toggleInputMethod(method) {
    const textInputArea = document.getElementById('textInputArea');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const textInputBtn = document.getElementById('textInputBtn');
    const fileUploadBtn = document.getElementById('fileUploadBtn');

    if (method === 'text') {
      textInputArea.classList.remove('hidden');
      fileUploadArea.classList.add('hidden');
      textInputBtn.classList.add('active');
      fileUploadBtn.classList.remove('active');
    } else {
      textInputArea.classList.add('hidden');
      fileUploadArea.classList.remove('hidden');
      textInputBtn.classList.remove('active');
      fileUploadBtn.classList.add('active');
    }
  }

  handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      document.getElementById('inputText').value = text;
      this.toggleInputMethod('text');
      this.showNotification('File uploaded successfully!', 'success');
    };

    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      this.showNotification('Please upload a text file (.txt)', 'error');
    }
  }

  async summarizeText() {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
      this.showNotification('Please enter some text to summarize', 'error');
      return;
    }

    if (inputText.length < 100) {
      this.showNotification('Text should be at least 100 characters long for meaningful summarization', 'error');
      return;
    }

    const startTime = Date.now();
    this.showLoadingState();

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const summary = await this.generateSummary(inputText, this.currentMethod);
      const processingTime = Date.now() - startTime;

      this.displayResults(summary, inputText, processingTime);
      this.generateComparison(inputText);
      
    } catch (error) {
      this.showNotification('Error generating summary. Please try again.', 'error');
      this.hideLoadingState();
    }
  }

  async generateSummary(text, method) {
    // Simulate different AI summarization methods
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (method === 'extractive') {
      // Extractive: Select important sentences based on keyword frequency
      const words = text.toLowerCase().split(/\W+/);
      const wordFreq = {};
      
      words.forEach(word => {
        if (word.length > 3) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });

      const sentenceScores = sentences.map(sentence => {
        const sentenceWords = sentence.toLowerCase().split(/\W+/);
        const score = sentenceWords.reduce((acc, word) => {
          return acc + (wordFreq[word] || 0);
        }, 0);
        return { sentence: sentence.trim(), score };
      });

      sentenceScores.sort((a, b) => b.score - a.score);
      const topSentences = sentenceScores.slice(0, Math.min(3, sentences.length));
      
      return topSentences.map(item => item.sentence).join('. ') + '.';
      
    } else {
      // Abstractive: Generate new content (simulated)
      const keyTopics = this.extractKeyTopics(text);
      const summaryTemplates = [
        `This text primarily discusses ${keyTopics[0]} and explores the relationship with ${keyTopics[1]}. Key insights include the importance of understanding these concepts and their practical applications.`,
        `The document focuses on ${keyTopics[0]}, providing detailed analysis of ${keyTopics[1]}. The author emphasizes the significance of these topics in modern contexts and suggests future directions for research.`,
        `An examination of ${keyTopics[0]} reveals interesting patterns related to ${keyTopics[1]}. The text presents compelling evidence and draws meaningful conclusions about their interconnected nature.`
      ];
      
      const randomTemplate = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
      return randomTemplate;
    }
  }

  extractKeyTopics(text) {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
    
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 4 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    return sortedWords.length >= 2 ? sortedWords : ['technology', 'innovation'];
  }

  showLoadingState() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
  }

  hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
  }

  displayResults(summary, originalText, processingTime) {
    this.hideLoadingState();
    
    // Show results section
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('summaryText').textContent = summary;
    
    // Update metrics
    const compressionRatio = Math.round((1 - summary.length / originalText.length) * 100);
    document.getElementById('compressionRatio').textContent = `${compressionRatio}%`;
    document.getElementById('processingTime').textContent = `${(processingTime / 1000).toFixed(1)}s`;
    document.getElementById('methodUsed').textContent = this.currentMethod.charAt(0).toUpperCase() + this.currentMethod.slice(1);

    // Animate text appearance
    this.animateTextAppearance('summaryText');
    
    this.showNotification('Summary generated successfully!', 'success');
  }

  async generateComparison(originalText) {
    try {
      const extractiveSummary = await this.generateSummary(originalText, 'extractive');
      const abstractiveSummary = await this.generateSummary(originalText, 'abstractive');
      
      document.getElementById('extractiveResult').textContent = extractiveSummary;
      document.getElementById('abstractiveResult').textContent = abstractiveSummary;
      document.getElementById('comparisonResults').classList.remove('hidden');
    } catch (error) {
      console.error('Error generating comparison:', error);
    }
  }

  animateTextAppearance(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100);
  }

  showTab(tabName) {
    const summaryTab = document.getElementById('summaryTab');
    const metricsTab = document.getElementById('metricsTab');
    const summaryContent = document.getElementById('summaryContent');
    const metricsContent = document.getElementById('metricsContent');

    if (tabName === 'summary') {
      summaryTab.classList.add('active');
      metricsTab.classList.remove('active');
      summaryContent.classList.remove('hidden');
      metricsContent.classList.add('hidden');
    } else {
      summaryTab.classList.remove('active');
      metricsTab.classList.add('active');
      summaryContent.classList.add('hidden');
      metricsContent.classList.remove('hidden');
    }
  }

  copySummary() {
    const summaryText = document.getElementById('summaryText').textContent;
    navigator.clipboard.writeText(summaryText).then(() => {
      this.showNotification('Summary copied to clipboard!', 'success');
    }).catch(() => {
      this.showNotification('Failed to copy text', 'error');
    });
  }

  downloadSummary() {
    const summaryText = document.getElementById('summaryText').textContent;
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Summary downloaded!', 'success');
  }

  shareSummary() {
    const summaryText = document.getElementById('summaryText').textContent;
    
    if (navigator.share) {
      navigator.share({
        title: 'AI Generated Summary',
        text: summaryText,
        url: window.location.href
      }).then(() => {
        this.showNotification('Summary shared!', 'success');
      }).catch(() => {
        this.fallbackShare(summaryText);
      });
    } else {
      this.fallbackShare(summaryText);
    }
  }

  fallbackShare(text) {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this AI-generated summary: ' + text.substring(0, 200) + '...')}`;
    window.open(shareUrl, '_blank');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation' : 'fa-info'} mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new TextSummarizer();
});

// Add some sample text for demonstration
document.addEventListener('DOMContentLoaded', () => {
  const sampleText = `Artificial Intelligence (AI) has emerged as one of the most transformative technologies of the 21st century, revolutionizing industries and reshaping the way we live and work. From healthcare and finance to transportation and entertainment, AI applications are becoming increasingly sophisticated and widespread. Machine learning algorithms can now process vast amounts of data to identify patterns, make predictions, and automate complex decision-making processes. 

Natural Language Processing (NLP) has enabled computers to understand and generate human language, leading to the development of chatbots, virtual assistants, and automated translation services. Computer vision technologies allow machines to interpret and analyze visual information, powering applications like autonomous vehicles, medical image analysis, and quality control systems in manufacturing.

The rapid advancement of AI has also raised important ethical considerations about privacy, bias, and the future of employment. As AI systems become more capable, there is an ongoing debate about how to ensure they are developed and deployed responsibly. Organizations worldwide are working to establish guidelines and frameworks for ethical AI development, focusing on transparency, fairness, and accountability.

Looking ahead, the potential applications of AI seem limitless. From climate change mitigation and drug discovery to space exploration and personalized education, AI has the potential to address some of humanity's greatest challenges while creating new opportunities for innovation and growth.`;

  // Add a button to load sample text
  setTimeout(() => {
    const loadSampleBtn = document.createElement('button');
    loadSampleBtn.textContent = 'Load Sample Text';
    loadSampleBtn.className = 'btn-secondary mb-4';
    loadSampleBtn.onclick = () => {
      document.getElementById('inputText').value = sampleText;
    };
    
    const textInputArea = document.getElementById('textInputArea');
    if (textInputArea) {
      textInputArea.insertBefore(loadSampleBtn, textInputArea.firstChild);
    }
  }, 100);
});
