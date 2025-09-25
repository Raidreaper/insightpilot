// App state
const state = {
  rawData: null,
  parsedData: [],
  headers: [],
  chartInstances: [],
  currentStep: 1,
  selectedMetrics: [],
  chartTypes: {},
  filters: [],
  selectedDimension: null,
  aggregations: {}, // { field: 'sum'|'avg'|'count' }
  timeGranularity: 'auto' // 'auto'|'day'|'week'|'month'
};

// DOM Elements
const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
const landing = document.getElementById('landing');
const csvUpload = document.getElementById('csvUpload');
const csvFile = document.getElementById('csvFile');
const googleFormUrl = document.getElementById('googleFormUrl');
const docUpload = document.getElementById('docUpload');
const docFile = document.getElementById('docFile');
const manualData = document.getElementById('manualData');
const loadDataBtn = document.getElementById('loadDataBtn');
const loader = document.getElementById('loader');
const dataPreview = document.getElementById('dataPreview');
const validationMessages = document.getElementById('validationMessages');
const fieldTypes = document.getElementById('fieldTypes');
const metricsSelection = document.getElementById('metricsSelection');
const dimensionSelection = document.getElementById('dimensionSelection');
const aggregationControls = document.getElementById('aggregationControls');
const chartSuggestions = document.getElementById('chartSuggestions');
const dashboardGrid = document.getElementById('dashboardGrid');
const insightReport = document.getElementById('insightReport');
const summaryStats = document.getElementById('summaryStats');
const filtersContainer = document.getElementById('filters');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportImageBtn = document.getElementById('exportImageBtn');
const shareLinkBtn = document.getElementById('shareLinkBtn');
const refreshDataBtn = document.getElementById('refreshDataBtn');
// Step 5 export controls
const renderFullTableBtn = document.getElementById('renderFullTableBtn');
const exportFullTablePngBtn = document.getElementById('exportFullTablePngBtn');
const exportFullTablePdfBtn = document.getElementById('exportFullTablePdfBtn');
const exportFullTableDocBtn = document.getElementById('exportFullTableDocBtn');
const exportSelectedImageBtn = document.getElementById('exportSelectedImageBtn');
const exportSelectedPdfBtn = document.getElementById('exportSelectedPdfBtn');
const shareSelectedBtn = document.getElementById('shareSelectedBtn');
const fullDataTable = document.getElementById('fullDataTable');
const metricSelector = document.getElementById('metricSelector');

// Authentication DOM Elements
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const demoBtn = document.getElementById('demoBtn');
const userDisplayName = document.getElementById('userDisplayName');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const tryDemoBtn = document.getElementById('tryDemoBtn');
const headerGetStartedBtn = document.getElementById('headerGetStartedBtn');
const headerTryDemoBtn = document.getElementById('headerTryDemoBtn');

// Authentication Event Listeners
loginTab.addEventListener('click', () => switchAuthForm('login'));
signupTab.addEventListener('click', () => switchAuthForm('signup'));
loginBtn.addEventListener('click', handleLogin);
signupBtn.addEventListener('click', handleSignup);
demoBtn.addEventListener('click', handleDemoLogin);
if (googleSignInBtn) googleSignInBtn.addEventListener('click', handleGoogleSignIn);
if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
if (getStartedBtn) getStartedBtn.addEventListener('click', () => {
  // Show auth step
  goToStep(0);
  hideLanding();
});
if (tryDemoBtn) tryDemoBtn.addEventListener('click', () => {
  handleDemoLogin();
  hideLanding();
});
if (headerGetStartedBtn) headerGetStartedBtn.addEventListener('click', () => {
  goToStep(0);
  hideLanding();
});
if (headerTryDemoBtn) headerTryDemoBtn.addEventListener('click', () => {
  handleDemoLogin();
  hideLanding();
});

// Navigation buttons
document.getElementById('backToStep1').addEventListener('click', () => { goToStep(1); hideLanding(); });
document.getElementById('previewNextBtn').addEventListener('click', () => goToStep(3));
document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
document.getElementById('metricsNextBtn').addEventListener('click', () => goToStep(4));
document.getElementById('backToStep3').addEventListener('click', () => goToStep(3));
document.getElementById('chartsNextBtn').addEventListener('click', () => goToStep(5));
document.getElementById('backToStep4').addEventListener('click', () => goToStep(4));
document.getElementById('startOverBtn').addEventListener('click', () => { goToStep(1); hideLanding(); });

// File upload handlers
csvUpload.addEventListener('click', () => csvFile.click());
csvUpload.addEventListener('dragover', (e) => {
  e.preventDefault();
  csvUpload.style.borderColor = '#0a164d';
  csvUpload.style.background = '#f0f4ff';
});
csvUpload.addEventListener('dragleave', (e) => {
  e.preventDefault();
  csvUpload.style.borderColor = '#dee2e6';
  csvUpload.style.background = '';
});
csvUpload.addEventListener('drop', (e) => {
  e.preventDefault();
  csvUpload.style.borderColor = '#dee2e6';
  csvUpload.style.background = '';
  if (e.dataTransfer.files.length) {
    csvFile.files = e.dataTransfer.files;
    csvUpload.querySelector('p').textContent = `File selected: ${e.dataTransfer.files[0].name}`;
  }
});
csvFile.addEventListener('change', (e) => {
  if (e.target.files.length) {
    csvUpload.querySelector('p').textContent = `File selected: ${e.target.files[0].name}`;
  }
});

docUpload.addEventListener('click', () => docFile.click());
docUpload.addEventListener('dragover', (e) => {
  e.preventDefault();
  docUpload.style.borderColor = '#0a164d';
  docUpload.style.background = '#f0f4ff';
});
docUpload.addEventListener('dragleave', (e) => {
  e.preventDefault();
  docUpload.style.borderColor = '#dee2e6';
  docUpload.style.background = '';
});
docUpload.addEventListener('drop', (e) => {
  e.preventDefault();
  docUpload.style.borderColor = '#dee2e6';
  docUpload.style.background = '';
  if (e.dataTransfer.files.length) {
    docFile.files = e.dataTransfer.files;
    docUpload.querySelector('p').textContent = `File selected: ${e.dataTransfer.files[0].name}`;
  }
});
docFile.addEventListener('change', (e) => {
  if (e.target.files.length) {
    docUpload.querySelector('p').textContent = `File selected: ${e.target.files[0].name}`;
  }
});

// Load Data Button
loadDataBtn.addEventListener('click', async () => {
  showLoader();
  
  try {
    // Reset parsed data
    state.parsedData = [];
    state.headers = [];
    
    // Process CSV
    if (csvFile.files.length > 0) {
      const file = csvFile.files[0];
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      state.parsedData = result.data;
      state.headers = Object.keys(result.data[0] || {});
    }
    
    // Process manual data
    else if (manualData.value.trim()) {
      const lines = manualData.value.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));
      
      state.parsedData = data;
      state.headers = headers;
    }
    
    // Process Google Forms URL
    else if (googleFormUrl.value.trim()) {
      try {
        const response = await fetchGoogleFormsData(googleFormUrl.value);
        state.parsedData = response.data;
        state.headers = response.headers;
      } catch (error) {
        throw new Error('Unable to fetch Google Forms data. Please check the URL and try again.');
      }
    }
    
    // If no data, create sample
    if (state.parsedData.length === 0) {
      state.parsedData = [
        { Product: 'Widget A', Sales: 150, Date: '2025-01-15', Rating: 4.5 },
        { Product: 'Widget B', Sales: 200, Date: '2025-01-16', Rating: 4.2 },
        { Product: 'Widget C', Sales: 180, Date: '2025-01-17', Rating: 4.8 },
        { Product: 'Widget A', Sales: 160, Date: '2025-01-18', Rating: 4.3 },
        { Product: 'Widget B', Sales: 220, Date: '2025-01-19', Rating: 4.6 }
      ];
      state.headers = ['Product', 'Sales', 'Date', 'Rating'];
    }
    
    // Process document if uploaded
    if (docFile.files.length > 0) {
      const file = docFile.files[0];
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log('Extracted text from DOCX:', result.value);
        // In a real app, we'd parse this text for data
      } else if (file.name.endsWith('.pdf')) {
        console.log('PDF processing would happen here');
        // In a real app, we'd use a PDF parser
      }
    }
    
    // Hide loader and go to preview
    hideLoader();
    goToStep(2);
    renderDataPreview();
    
  } catch (error) {
    hideLoader();
    showError('Error processing data: ' + error.message);
    console.error(error);
  }
});

// Google Forms data fetching (simplified)
async function fetchGoogleFormsData(url) {
  // This is a simplified implementation
  // In a real app, you'd need to use Google Forms API or a proxy service
  throw new Error('Google Forms integration requires backend service. Please use CSV upload or manual data entry for now.');
}

function showLoader() {
  loader.style.display = 'block';
  dataPreview.innerHTML = '';
}

function hideLoader() {
  loader.style.display = 'none';
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  
  // Insert after the current step's card
  const currentCard = document.querySelector('.step.active .card');
  currentCard.appendChild(errorDiv);
  
  // Remove error after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  
  // Insert after the current step's card
  const currentCard = document.querySelector('.step.active .card');
  currentCard.appendChild(successDiv);
  
  // Remove success message after 3 seconds
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

function goToStep(step) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active');
  });
  
  // Show current step
  document.getElementById(`step${step}`).classList.add('active');
  state.currentStep = step;
  // Hide landing once user navigates into flow
  if (landing) {
    landing.style.display = 'none';
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

function hideLanding() {
  if (landing) landing.style.display = 'none';
}

// Authentication Functions
function switchAuthForm(formType) {
  // Update tabs
  loginTab.classList.toggle('active', formType === 'login');
  signupTab.classList.toggle('active', formType === 'signup');
  
  // Update forms
  loginForm.classList.toggle('active', formType === 'login');
  signupForm.classList.toggle('active', formType === 'signup');
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  // Simple authentication (in real app, this would call an API)
  const user = authenticateUser(email, password);
  if (user) {
    state.currentUser = user;
    userDisplayName.textContent = user.name;
    goToStep(1);
    showSuccess(`Welcome back, ${user.name}!`);
  } else {
    showError('Invalid email or password');
  }
}

function handleSignup() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (!name || !email || !password || !confirmPassword) {
    showError('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  // Simple signup (in real app, this would call an API)
  const user = createUser(name, email, password);
  if (user) {
    state.currentUser = user;
    userDisplayName.textContent = user.name;
    goToStep(1);
    showSuccess(`Account created successfully! Welcome, ${user.name}!`);
  } else {
    showError('Email already exists. Please try logging in instead.');
  }
}

function handleDemoLogin() {
  state.currentUser = {
    id: 'demo',
    name: 'Demo User',
    email: 'demo@insightpilot.com',
    isDemo: true
  };
  userDisplayName.textContent = 'Demo User';
  goToStep(1);
  showSuccess('Welcome! You\'re using the demo version.');
}

// Firebase Auth (if available)
function handleGoogleSignIn() {
  if (!window.firebase || !firebase.auth) {
    showError('Google Sign-In requires Firebase Auth to be loaded.');
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(result => {
    const u = result.user;
    state.currentUser = { id: u.uid, name: u.displayName || 'User', email: u.email };
    userDisplayName.textContent = state.currentUser.name;
    goToStep(1);
    showSuccess(`Signed in as ${state.currentUser.name}`);
  }).catch(err => {
    console.error(err);
    showError('Google Sign-In failed.');
  });
}

function handleSignOut() {
  if (window.firebase && firebase.auth) {
    firebase.auth().signOut().then(() => {
      state.currentUser = null;
      userDisplayName.textContent = 'Signed out';
      showSuccess('Signed out');
      goToStep(0);
    }).catch(err => {
      console.error(err);
      showError('Sign out failed.');
    });
  } else {
    state.currentUser = null;
    userDisplayName.textContent = 'Signed out';
    goToStep(0);
  }
}

if (window.firebase && firebase.auth) {
  firebase.auth().onAuthStateChanged(u => {
    if (u) {
      state.currentUser = { id: u.uid, name: u.displayName || 'User', email: u.email };
      userDisplayName.textContent = state.currentUser.name;
    }
  });
}

function authenticateUser(email, password) {
  // Simple localStorage-based authentication
  const users = JSON.parse(localStorage.getItem('insightpilot_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  return user ? { id: user.id, name: user.name, email: user.email } : null;
}

function createUser(name, email, password) {
  // Simple localStorage-based user creation
  const users = JSON.parse(localStorage.getItem('insightpilot_users') || '[]');
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return null;
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('insightpilot_users', JSON.stringify(users));
  
  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

function renderDataPreview() {
  // Create table
  let tableHTML = '<table><thead><tr>';
  state.headers.forEach(header => {
    tableHTML += `<th>${header}</th>`;
  });
  tableHTML += '</tr></thead><tbody>';
  
  // Add data rows (first 5)
  state.parsedData.slice(0, 5).forEach(row => {
    tableHTML += '<tr>';
    state.headers.forEach(header => {
      tableHTML += `<td>${row[header] || ''}</td>`;
    });
    tableHTML += '</tr>';
  });
  
  if (state.parsedData.length > 5) {
    tableHTML += `<tr><td colspan="${state.headers.length}" style="text-align:center; font-style:italic;">... and ${state.parsedData.length - 5} more rows</td></tr>`;
  }
  
  tableHTML += '</tbody></table>';
  dataPreview.innerHTML = tableHTML;
  // Ensure export bar visible in step 2 when table is ready
  const previewBar = document.getElementById('previewExportBar');
  if (previewBar) previewBar.style.display = 'flex';
  
  // Detect field types
  detectFieldTypes();
  // Validate data
  renderValidationMessages();
}

function detectFieldTypes() {
  const fieldTypesHTML = state.headers.map(header => {
    const sampleValues = sampleColumnValues(header, 20);
    const inferred = inferTypeFromSamples(sampleValues);
    const sample = state.parsedData[0][header];
    let type = 'text';
    let icon = '🔤';
    
    if (inferred === 'number') { type = 'number'; icon = '🔢'; }
    else if (inferred === 'date') { type = 'date'; icon = '📅'; }
    else if (inferred === 'boolean') { type = 'boolean'; icon = '✅'; }
    
    return `
      <div style="margin: 5px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
        ${icon} <strong>${header}</strong>: <span style="color:var(--primary);">${type}</span>
      </div>
    `;
  }).join('');
  
  fieldTypes.innerHTML = `<h4>Detected Field Types:</h4>${fieldTypesHTML}`;
}

function sampleColumnValues(header, sampleCount) {
  const values = [];
  for (let i = 0; i < state.parsedData.length && values.length < sampleCount; i++) {
    if (header in state.parsedData[i]) values.push(state.parsedData[i][header]);
  }
  return values;
}

function inferTypeFromSamples(values) {
  let numCount = 0, dateCount = 0, boolCount = 0, nonEmpty = 0;
  values.forEach(v => {
    if (v === null || v === undefined || String(v).trim() === '') return;
    nonEmpty++;
    const s = String(v).trim();
    if (!isNaN(s) && s !== '') numCount++;
    if ((s.includes('/') || s.includes('-')) && !isNaN(new Date(s))) dateCount++;
    if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false') boolCount++;
  });
  if (nonEmpty === 0) return 'text';
  if (numCount / nonEmpty > 0.8) return 'number';
  if (dateCount / nonEmpty > 0.6) return 'date';
  if (boolCount / nonEmpty > 0.8) return 'boolean';
  return 'text';
}

function renderValidationMessages() {
  const messages = [];
  // Missing values
  state.headers.forEach(h => {
    const empties = state.parsedData.filter(r => !r[h] && r[h] !== 0).length;
    if (empties > 0) messages.push(`Field "${h}" has ${empties} missing value(s).`);
  });
  // Duplicate headers
  const headerSet = new Set();
  state.headers.forEach(h => {
    if (headerSet.has(h)) messages.push(`Duplicate column name detected: "${h}".`);
    headerSet.add(h);
  });
  // Large dataset hint
  if (state.parsedData.length > 5000) messages.push(`Large dataset detected (${state.parsedData.length} rows). Charts may be downsampled for performance.`);
  
  validationMessages.innerHTML = messages.map(m => `<div class="warning" role="status">${m}</div>`).join('');
}

// Step 3: Select Metrics
document.getElementById('previewNextBtn').addEventListener('click', () => {
  renderMetricsSelection();
  goToStep(3);
});

function renderMetricsSelection() {
  metricsSelection.innerHTML = '';
  dimensionSelection.innerHTML = '';
  aggregationControls.innerHTML = '';
  
  state.headers.forEach(header => {
    const sample = state.parsedData[0][header];
    let isMetric = false;
    let description = 'Text value';
    
    if (!isNaN(sample) && sample !== '' && !isNaN(parseFloat(sample))) {
      isMetric = true;
      if (header.toLowerCase().includes('sales') || 
          header.toLowerCase().includes('revenue') ||
          header.toLowerCase().includes('price') ||
          header.toLowerCase().includes('cost')) {
        description = 'Financial metric';
      } else if (header.toLowerCase().includes('count') ||
                header.toLowerCase().includes('number') ||
                header.toLowerCase().includes('quantity')) {
        description = 'Count or quantity';
      } else if (header.toLowerCase().includes('rating') ||
                header.toLowerCase().includes('score') ||
                header.toLowerCase().includes('grade')) {
        description = 'Rating or score (1-5)';
      } else {
        description = 'Numerical value';
      }
    } else if (header.toLowerCase().includes('date') ||
              header.toLowerCase().includes('time')) {
      description = 'Date or time';
      isMetric = true;
    }
    
    const metricCard = document.createElement('div');
    metricCard.className = `metric-card ${isMetric ? 'selected' : ''}`;
    metricCard.setAttribute('data-field', header);
    metricCard.setAttribute('data-type', isMetric ? 'metric' : 'dimension');
    
    metricCard.innerHTML = `
      <h4>${header}</h4>
      <p style="font-size:0.9rem; color:var(--gray); margin:10px 0;">${description}</p>
      <small>Sample: ${sample}</small>
    `;
    
    metricCard.addEventListener('click', function() {
      this.classList.toggle('selected');
    });
    
    metricsSelection.appendChild(metricCard);
  });

  // Dimension selection control
  const dimensionCandidates = state.headers.filter(h => !state.selectedMetrics.some(m => m.field === h && m.type === 'metric'));
  const dimCard = document.createElement('div');
  dimCard.className = 'control-card';
  dimCard.innerHTML = `
    <label for="dimensionField">Dimension (X-axis or Group By)</label>
    <select id="dimensionField" aria-label="Dimension field">
      <option value="">Auto</option>
      ${dimensionCandidates.map(h => `<option value="${h}">${h}</option>`).join('')}
    </select>
    <div style="margin-top:10px;">
      <label for="timeGranularity">Time granularity</label>
      <select id="timeGranularity" aria-label="Time granularity">
        <option value="auto">Auto</option>
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>
  `;
  dimensionSelection.appendChild(dimCard);

  // Aggregation controls per metric
  state.headers.forEach(header => {
    const sample = state.parsedData[0][header];
    const isNumeric = !isNaN(sample) && sample !== '' && !isNaN(parseFloat(sample));
    if (!isNumeric) return;
    const aggCard = document.createElement('div');
    aggCard.className = 'control-card';
    aggCard.innerHTML = `
      <label for="agg-${header}">Aggregation for ${header}</label>
      <select id="agg-${header}" data-field="${header}" aria-label="Aggregation for ${header}">
        <option value="sum">Sum</option>
        <option value="avg">Average</option>
        <option value="count">Count</option>
      </select>
    `;
    aggregationControls.appendChild(aggCard);
  });
}

// Step 4: Choose Charts
document.getElementById('metricsNextBtn').addEventListener('click', () => {
  state.selectedMetrics = [];
  document.querySelectorAll('.metric-card.selected').forEach(card => {
    state.selectedMetrics.push({
      field: card.getAttribute('data-field'),
      type: card.getAttribute('data-type')
    });
  });
  
  if (state.selectedMetrics.length === 0) {
    showError('Please select at least one metric to visualize.');
    return;
  }
  // Persist controls
  const dimEl = document.getElementById('dimensionField');
  state.selectedDimension = dimEl ? dimEl.value || null : null;
  const granEl = document.getElementById('timeGranularity');
  state.timeGranularity = granEl ? granEl.value : 'auto';
  state.aggregations = {};
  aggregationControls.querySelectorAll('select[id^="agg-"]').forEach(sel => {
    state.aggregations[sel.getAttribute('data-field')] = sel.value;
  });
  
  renderChartSuggestions();
  goToStep(4);
});

function renderChartSuggestions() {
  chartSuggestions.innerHTML = '';
  
  // Clear previous chart types
  state.chartTypes = {};
  
  state.selectedMetrics.forEach(metric => {
    const sample = state.parsedData[0][metric.field];
    let chartOptions = [];
    
    if (metric.type === 'metric') {
      if (!isNaN(sample) && sample !== '' && parseFloat(sample) <= 5 && parseFloat(sample) >= 1) {
        // Likely a rating (1-5 scale)
        chartOptions = [
          { type: 'pie', label: 'Pie Chart', desc: 'Show distribution of ratings' },
          { type: 'bar', label: 'Bar Chart', desc: 'Compare average ratings' }
        ];
      } else {
        // Regular numerical metric
        chartOptions = [
          { type: 'line', label: 'Line Chart', desc: 'Show trends over time' },
          { type: 'bar', label: 'Bar Chart', desc: 'Compare values across categories' },
          { type: 'table', label: 'Data Table', desc: 'Show exact values' }
        ];
      }
    } else {
      // Dimension (like date, category)
      chartOptions = [
        { type: 'bar', label: 'Bar Chart', desc: 'Count occurrences' },
        { type: 'pie', label: 'Pie Chart', desc: 'Show proportions' },
        { type: 'table', label: 'Data Table', desc: 'List all values' }
      ];
    }
    
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.maxWidth = '300px';
    
    container.innerHTML = `
      <h4 style="margin-bottom:15px;">${metric.field}</h4>
    `;
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'chart-suggestion';
    
    chartOptions.forEach(option => {
      const optionEl = document.createElement('div');
      optionEl.className = 'chart-option';
      optionEl.setAttribute('data-field', metric.field);
      optionEl.setAttribute('data-chart', option.type);
      
      if (option.type === 'line' || state.selectedMetrics.length === 1) {
        optionEl.classList.add('selected');
        state.chartTypes[metric.field] = option.type;
      }
      
      optionEl.innerHTML = `
        <strong>${option.label}</strong>
        <p style="font-size:0.8rem; margin:10px 0 0; color:var(--gray);">${option.desc}</p>
      `;
      
      optionEl.addEventListener('click', function() {
        // Remove selected from all options for this field
        document.querySelectorAll(`.chart-option[data-field="${metric.field}"]`).forEach(el => {
          el.classList.remove('selected');
        });
        // Add selected to this one
        this.classList.add('selected');
        // Update state
        state.chartTypes[metric.field] = option.type;
      });
      
      optionsContainer.appendChild(optionEl);
    });
    
    container.appendChild(optionsContainer);
    chartSuggestions.appendChild(container);
  });
}

// Step 5: Generate Dashboard
document.getElementById('chartsNextBtn').addEventListener('click', () => {
  // Ensure all metrics have a chart type
  state.selectedMetrics.forEach(metric => {
    if (!state.chartTypes[metric.field]) {
      state.chartTypes[metric.field] = 'bar'; // default
    }
  });
  
  generateDashboard();
  // Build selector UI after dashboard renders
  if (typeof renderMetricSelector === 'function') {
    try { renderMetricSelector(); } catch (e) { /* noop */ }
  }
  goToStep(5);
});

function generateDashboard() {
  // Clear previous charts
  state.chartInstances.forEach(chart => chart.destroy());
  state.chartInstances = [];
  dashboardGrid.innerHTML = '';
  summaryStats.innerHTML = '';
  insightReport.innerHTML = '';
  filtersContainer.innerHTML = '';
  
  // Generate summary statistics
  generateSummaryStats();
  
  // Generate insight report
  generateInsightReport();
  
  // Create filters
  createFilters();
  
  // Create charts
  state.selectedMetrics.forEach(metric => {
    createChart(metric.field, state.chartTypes[metric.field]);
  });

  // Persist analysis record if Firestore and user available
  try {
    if (window.db && state.currentUser) {
      const analysisDoc = {
        userId: state.currentUser.id || 'anon',
        createdAt: new Date().toISOString(),
        headers: state.headers,
        selectedMetrics: state.selectedMetrics,
        chartTypes: state.chartTypes,
        dataPreviewCount: state.parsedData.length
      };
      window.db.collection('analyses').add(analysisDoc).catch(err => console.warn('Failed to save analysis:', err));
    }
  } catch (e) { /* noop */ }
}

function generateSummaryStats() {
  const stats = [];
  
  state.selectedMetrics.forEach(metric => {
    const values = state.parsedData.map(row => {
      const val = row[metric.field];
      return !isNaN(val) && val !== '' ? parseFloat(val) : null;
    }).filter(val => val !== null);
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      if (metric.field.toLowerCase().includes('sales') || 
          metric.field.toLowerCase().includes('revenue')) {
        stats.push({
          label: 'Total Sales',
          value: '$' + sum.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          trend: 'up'
        });
        stats.push({
          label: 'Average Sale',
          value: '$' + avg.toFixed(2),
          trend: 'neutral'
        });
      } else if (metric.field.toLowerCase().includes('rating') ||
                metric.field.toLowerCase().includes('score')) {
        stats.push({
          label: 'Average Rating',
          value: avg.toFixed(1) + '/5',
          trend: avg > 4 ? 'up' : avg > 3 ? 'neutral' : 'down'
        });
        stats.push({
          label: 'Highest Rating',
          value: max + '/5',
          trend: 'up'
        });
      } else if (values.length > 1) {
        stats.push({
          label: `Total ${metric.field}`,
          value: sum.toFixed(0),
          trend: 'neutral'
        });
        stats.push({
          label: `Avg ${metric.field}`,
          value: avg.toFixed(1),
          trend: 'neutral'
        });
      }
    }
  });
  
  // Add count if we have data
  if (state.parsedData.length > 0) {
    stats.unshift({
      label: 'Total Records',
      value: state.parsedData.length,
      trend: 'neutral'
    });
  }
  
  summaryStats.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');
}

function generateInsightReport() {
  let report = '';
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  
  // Find sales and rating fields
  const salesField = state.selectedMetrics.find(m => 
    m.field.toLowerCase().includes('sales') || 
    m.field.toLowerCase().includes('revenue')
  );
  const ratingField = state.selectedMetrics.find(m => 
    m.field.toLowerCase().includes('rating') || 
    m.field.toLowerCase().includes('score')
  );
  const dateField = state.selectedMetrics.find(m => 
    m.field.toLowerCase().includes('date') || 
    m.field.toLowerCase().includes('time')
  );
  
  const salesValues = salesField ? state.parsedData.map(row => {
    const val = row[salesField.field];
    return !isNaN(val) && val !== '' ? parseFloat(val) : 0;
  }).filter(val => val > 0) : [];
  
  const ratingValues = ratingField ? state.parsedData.map(row => {
    const val = row[ratingField.field];
    return !isNaN(val) && val !== '' ? parseFloat(val) : 0;
  }).filter(val => val > 0) : [];
  
  report += `<strong>Monthly Business Snapshot – ${month} ${year}</strong><br><br>`;
  
  if (salesValues.length > 0) {
    const totalSales = salesValues.reduce((a, b) => a + b, 0);
    const avgSales = totalSales / salesValues.length;
    report += `- <strong>Total sales this period: $${totalSales.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</strong>`;
    
    if (ratingValues.length > 0) {
      const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
      report += `, with an average customer rating of <strong>${avgRating.toFixed(1)}/5 ⭐</strong>.`;
    } else {
      report += '.';
    }
    
    if (salesValues.length > 1) {
      const first = salesValues[0];
      const last = salesValues[salesValues.length-1];
      const growth = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
      const delta = last - first;
      report += ` (change vs start: ${delta >= 0 ? '+' : ''}${delta.toFixed(0)}, ${growth.toFixed(1)}%)`;
      if (growth > 10) {
        report += ` This shows a strong upward trend.`;
      } else if (growth > 0) {
        report += ` Sales are trending upward.`;
      } else if (growth > -10) {
        report += ` Sales are relatively stable.`;
      } else {
        report += ` Sales have declined recently.`;
      }
    }
    
    report += '<br>';
  }
  
  if (ratingValues.length > 0) {
    const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
    report += `- Customers are `;
    if (avgRating >= 4.5) report += 'extremely satisfied';
    else if (avgRating >= 4.0) report += 'very satisfied';
    else if (avgRating >= 3.5) report += 'satisfied';
    else if (avgRating >= 3.0) report += 'somewhat satisfied';
    else report += 'not satisfied';
    report += ` — average rating is <strong>${avgRating.toFixed(1)} out of 5</strong>.`;
    
    if (avgRating >= 4.0) {
      report += ` This is excellent!`;
    } else if (avgRating >= 3.0) {
      report += ` Consider gathering more feedback to improve.`;
    } else {
      report += ` This is a concern — you may want to investigate why ratings are low.`;
    }
    report += '<br>';
  }
  
  // Product analysis if we have product field
  const productField = state.headers.find(h => 
    h.toLowerCase().includes('product') || 
    h.toLowerCase().includes('item') ||
    h.toLowerCase().includes('name')
  );
  
  if (productField && salesField) {
    const productSales = {};
    state.parsedData.forEach(row => {
      const product = row[productField];
      const sales = parseFloat(row[salesField.field]) || 0;
      productSales[product] = (productSales[product] || 0) + sales;
    });
    
    const topProduct = Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b
    );
    
    report += `- Your best-performing product was <strong>"${topProduct}"</strong>, `;
    if (productSales[topProduct] / salesValues.reduce((a,b)=>a+b,0) > 0.3) {
      report += `making up over 30% of all sales. This is your star performer!`;
    } else {
      report += `which performed well among your offerings.`;
    }
    report += '<br>';
  }
  
  // Recommendations
  report += `<br><strong>💡 Recommendation:</strong> `;
  if (salesValues.length > 0 && ratingValues.length > 0) {
    const avgSales = salesValues.reduce((a,b)=>a+b,0)/salesValues.length;
    const avgRating = ratingValues.reduce((a,b)=>a+b,0)/ratingValues.length;
    
    if (avgSales > 100 && avgRating > 4.0) {
      report += `You're doing great on both sales and satisfaction. Consider expanding your product line or marketing efforts to grow further.`;
    } else if (avgSales > 100) {
      report += `Your sales are strong, but customer satisfaction could improve. Look for ways to enhance the customer experience.`;
    } else if (avgRating > 4.0) {
      report += `Customers love your products, but sales could be higher. Try promotional campaigns or discounts to boost revenue.`;
    } else {
      report += `Focus on both improving product quality and marketing effectiveness. Start with customer feedback to identify key issues.`;
    }
  } else if (salesValues.length > 0) {
    report += `Monitor your sales trends closely. If they're growing, keep up the good work. If not, consider promotional strategies.`;
  } else {
    report += `Start tracking key metrics like sales and customer feedback to better understand your business performance.`;
  }
  
  insightReport.innerHTML = `<p>${report}</p>`;
}

function createFilters() {
  // Create filters for categorical fields
  const categoricalFields = state.headers.filter(header => {
    const values = state.parsedData.map(row => row[header]).filter(v => v);
    return values.length > 0 && values.length <= 10; // Small number of unique values
  });
  
  if (categoricalFields.length > 0) {
    filtersContainer.innerHTML = '<h4>Filter by:</h4>';
    
    categoricalFields.forEach(field => {
      const uniqueValues = [...new Set(state.parsedData.map(row => row[field]).filter(v => v))];
      const filterGroup = document.createElement('div');
      
      let filterHTML = `<span style="margin-right:10px; font-weight:600;">${field}:</span>`;
      filterHTML += `<button class="filter-btn active" data-field="${field}" data-value="all" aria-pressed="true">All</button>`;
      
      uniqueValues.forEach(value => {
        filterHTML += `<button class="filter-btn" data-field="${field}" data-value="${value}" aria-pressed="false">${value}</button>`;
      });
      
      filterGroup.innerHTML = filterHTML;
      filtersContainer.appendChild(filterGroup);
      
      // Add event listeners
      filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const isAll = this.getAttribute('data-value') === 'all';
          const fieldButtons = filterGroup.querySelectorAll(`.filter-btn[data-field="${field}"]`);
          if (isAll) {
            // Activate only All
            fieldButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
            this.classList.add('active'); this.setAttribute('aria-pressed','true');
          } else {
            // Toggle this value
            this.classList.toggle('active');
            const nowActive = this.classList.contains('active');
            this.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
            // Deactivate All if any specific selected; if none selected, reactivate All
            const anySpecificActive = Array.from(fieldButtons).some(b => b.getAttribute('data-value') !== 'all' && b.classList.contains('active'));
            const allBtn = filterGroup.querySelector(`.filter-btn[data-field="${field}"][data-value="all"]`);
            if (anySpecificActive) { allBtn.classList.remove('active'); allBtn.setAttribute('aria-pressed','false'); }
            else { allBtn.classList.add('active'); allBtn.setAttribute('aria-pressed','true'); }
          }
          refreshCharts();
        });
      });
    });

    // Clear all button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'filter-btn';
    clearBtn.textContent = 'Clear All Filters';
    clearBtn.addEventListener('click', () => {
      filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('data-value') === 'all') { btn.classList.add('active'); btn.setAttribute('aria-pressed','true'); }
        else { btn.classList.remove('active'); btn.setAttribute('aria-pressed','false'); }
      });
      refreshCharts();
    });
    filtersContainer.appendChild(clearBtn);
  }
}

function getFilteredData() {
  let filtered = [...state.parsedData];
  
  // Apply filters
  const groups = {};
  document.querySelectorAll('.filters > div').forEach(group => {
    const buttons = group.querySelectorAll('.filter-btn');
    if (buttons.length === 0) return;
    const field = buttons[0].getAttribute('data-field');
    if (!field) return;
    const selected = Array.from(buttons)
      .filter(b => b.getAttribute('data-value') !== 'all' && b.classList.contains('active'))
      .map(b => b.getAttribute('data-value'));
    if (selected.length > 0) groups[field] = new Set(selected);
  });
  Object.entries(groups).forEach(([field, set]) => {
    filtered = filtered.filter(row => set.has(row[field]));
  });
  
  return filtered;
}

function createChart(field, chartType) {
  const container = document.createElement('div');
  container.className = 'dashboard-item';
  
  const title = document.createElement('h3');
  title.textContent = field;
  container.appendChild(title);
  
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  dashboardGrid.appendChild(container);
  
  const ctx = canvas.getContext('2d');
  let data = getFilteredData();
  // If a dimension is selected, group/aggregate data
  if (state.selectedDimension) {
    const grouped = {};
    data.forEach(row => {
      let key = row[state.selectedDimension] || 'Unknown';
      // Time bucketing if dimension is date-like
      const sampleType = inferTypeFromSamples(sampleColumnValues(state.selectedDimension, 20));
      if (sampleType === 'date') {
        const d = new Date(key);
        if (!isNaN(d)) {
          key = formatBucket(d, state.timeGranularity);
        }
      }
      const v = parseFloat(row[field]);
      if (!grouped[key]) grouped[key] = [];
      if (!isNaN(v)) grouped[key].push(v);
    });
    const agg = state.aggregations[field] || 'sum';
    let labels = Object.keys(grouped);
    // Sort labels chronologically if they look like buckets
    if (labels.every(l => parseBucketDate(l) !== null)) {
      labels.sort((a,b)=> parseBucketDate(a) - parseBucketDate(b));
    }
    const values = labels.map(k => aggregateValues(grouped[k], agg));
    data = labels.map((l, i) => ({ label: l, value: values[i] }));
  }
  
  let chartConfig = {};
  
  if (chartType === 'table') {
    // Create HTML table instead
    canvas.remove();
    const table = document.createElement('div');
    table.className = 'data-preview';
    table.innerHTML = `
      <table>
        <thead>
          <tr>
            ${state.headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.slice(0, 10).map(row => `
            <tr>
              ${state.headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
            </tr>
          `).join('')}
          ${data.length > 10 ? `
            <tr>
              <td colspan="${state.headers.length}" style="text-align:center; font-style:italic;">
                ... and ${data.length - 10} more rows
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    `;
    container.appendChild(table);
    return;
  }
  
  // Extract values
  let labels = [];
  let values = [];
  if (state.selectedDimension) {
    labels = data.map(d => d.label);
    values = data.map(d => d.value);
  } else {
    labels = data.map(row => {
      const labelField = state.headers.find(h => 
        h !== field && 
        !state.selectedMetrics.some(m => m.field === h && m.type === 'metric')
      ) || 'Item';
      return row[labelField] || data.indexOf(row) + 1;
    });
    values = data.map(row => {
      const val = row[field];
      return !isNaN(val) && val !== '' ? parseFloat(val) : 0;
    });
  }

  // Basic downsampling for large series
  if (values.length > 1000) {
    const factor = Math.ceil(values.length / 1000);
    const dsLabels = [], dsValues = [];
    for (let i = 0; i < values.length; i += factor) {
      const sliceVals = values.slice(i, i + factor);
      const sliceLabs = labels.slice(i, i + factor);
      dsValues.push(aggregateValues(sliceVals, 'avg'));
      dsLabels.push(sliceLabs[Math.floor(sliceLabs.length / 2)]);
    }
    labels = dsLabels; values = dsValues;
  }
  
  // Chart configuration
  if (chartType === 'line') {
    chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: field,
          data: values,
          borderColor: '#0a164d',
          backgroundColor: 'rgba(10, 22, 77, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }
  else if (chartType === 'bar') {
    chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: field,
          data: values,
          backgroundColor: '#0a164d'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }
  else if (chartType === 'pie') {
    // Group small values into "Other"
    const valueMap = {};
    labels.forEach((label, i) => {
      valueMap[label] = (valueMap[label] || 0) + values[i];
    });
    
    const sortedEntries = Object.entries(valueMap).sort((a, b) => b[1] - a[1]);
    const total = sortedEntries.reduce((sum, [, value]) => sum + value, 0);
    
    let finalLabels = [];
    let finalValues = [];
    let otherSum = 0;
    
    sortedEntries.forEach(([label, value], i) => {
      if (i < 5 || (value / total) > 0.05) {
        finalLabels.push(label);
        finalValues.push(value);
      } else {
        otherSum += value;
      }
    });
    
    if (otherSum > 0) {
      finalLabels.push('Other');
      finalValues.push(otherSum);
    }
    
    chartConfig = {
      type: 'pie',
      data: {
        labels: finalLabels,
        datasets: [{
          data: finalValues,
          backgroundColor: [
            '#0a164d', '#3f37c9', '#4cc9f0', '#8338ec', '#f72585', '#b56576'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    };
  }
  
  // Create chart
  const chart = new Chart(ctx, chartConfig);
  state.chartInstances.push(chart);
}

function aggregateValues(values, agg) {
  const valid = values.filter(v => !isNaN(v));
  if (valid.length === 0) return 0;
  if (agg === 'avg') return valid.reduce((a,b)=>a+b,0) / valid.length;
  if (agg === 'count') return valid.length;
  return valid.reduce((a,b)=>a+b,0); // sum
}

function formatBucket(dateObj, granularity) {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  if (granularity === 'month') return `${y}-${String(m).padStart(2,'0')}`;
  if (granularity === 'week') {
    const w = getISOWeek(dateObj);
    return `${y}-W${String(w).padStart(2,'0')}`;
  }
  // 'day' or 'auto'
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function parseBucketDate(label) {
  // Try YYYY-MM, YYYY-Www, YYYY-MM-DD
  if (/^\d{4}-\d{2}$/.test(label)) return new Date(label + '-01');
  const weekMatch = label.match(/^(\d{4})-W(\d{2})$/);
  if (weekMatch) return getDateOfISOWeek(parseInt(weekMatch[2]), parseInt(weekMatch[1]));
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return new Date(label);
  const d = new Date(label);
  return isNaN(d) ? null : d;
}

function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}

function getDateOfISOWeek(week, year) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  return ISOweekStart;
}

function refreshCharts() {
  // Destroy existing charts
  state.chartInstances.forEach(chart => chart.destroy());
  state.chartInstances = [];
  
  // Recreate charts
  dashboardGrid.innerHTML = '';
  state.selectedMetrics.forEach(metric => {
    createChart(metric.field, state.chartTypes[metric.field]);
  });
}

// Build complete data table from parsed data
function renderFullDataTable() {
  if (!state.headers || state.headers.length === 0) return;
  let html = '<table><thead><tr>' + state.headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
  state.parsedData.forEach(row => {
    html += '<tr>' + state.headers.map(h => `<td>${row[h] ?? ''}</td>`).join('') + '</tr>';
  });
  html += '</tbody></table>';
  fullDataTable.innerHTML = html;
  fullDataTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderMetricSelector() {
  if (!metricSelector) return;
  const options = state.selectedMetrics.map(m => {
    const id = `sel-${m.field.replace(/[^a-z0-9]/gi,'_')}`;
    return `<label style="margin-right:12px;"><input type="checkbox" id="${id}" data-field="${m.field}" checked> ${m.field}</label>`;
  }).join('');
  metricSelector.innerHTML = `<div style=\"margin-bottom:8px; color:var(--gray)\">Choose metrics to export/share:</div>${options}`;
}

async function captureElementToCanvas(el) {
  return html2canvas(el, { scale: 2, useCORS: true, allowTaint: true });
}

async function exportElementAsPng(el, filename) {
  const canvas = await captureElementToCanvas(el);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

async function exportElementAsPdf(el, filename) {
  const canvas = await captureElementToCanvas(el);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight; let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) { position = heightLeft - imgHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); heightLeft -= pageHeight; }
  pdf.save(filename);
}

function exportElementAsDoc(el, filename) {
  const html = `<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Export</title></head><body>${el.innerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
}

function getSelectedMetricFields() {
  if (!metricSelector) return [];
  return Array.from(metricSelector.querySelectorAll('input[type="checkbox"][data-field]'))
    .filter(i => i.checked).map(i => i.getAttribute('data-field'));
}

function renderSelectedMetricsView() {
  const selected = getSelectedMetricFields();
  const container = document.createElement('div');
  container.style.padding = '10px';
  container.style.background = '#fff';
  container.innerHTML = `<h4 style="margin-bottom:10px;">Selected Metrics</h4>`;
  const tempGrid = document.createElement('div');
  tempGrid.className = 'dashboard-grid';
  container.appendChild(tempGrid);
  const oldGridRef = dashboardGrid;
  // Render into tempGrid
  window.__oldGrid = oldGridRef;
  const parent = tempGrid;
  selected.forEach(field => {
    const container = document.createElement('div');
    container.className = 'dashboard-item';
    const title = document.createElement('h3');
    title.textContent = field;
    container.appendChild(title);
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    parent.appendChild(container);
    const ctx = canvas.getContext('2d');
    // Simple bar for export view
    const values = state.parsedData.map(row => parseFloat(row[field]) || 0).slice(0, 10);
    new Chart(ctx, { type: 'bar', data: { labels: values.map((_,i)=> i+1), datasets: [{ data: values, backgroundColor: '#0a164d' }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
  });
  return container;
}

// Hook up buttons
if (renderFullTableBtn) renderFullTableBtn.addEventListener('click', renderFullDataTable);
if (exportFullTablePngBtn) exportFullTablePngBtn.addEventListener('click', async () => { if (!fullDataTable.innerHTML) renderFullDataTable(); await exportElementAsPng(fullDataTable, 'insightpilot-full-table.png'); });
if (exportFullTablePdfBtn) exportFullTablePdfBtn.addEventListener('click', async () => { if (!fullDataTable.innerHTML) renderFullDataTable(); await exportElementAsPdf(fullDataTable, 'insightpilot-full-table.pdf'); });
if (exportFullTableDocBtn) exportFullTableDocBtn.addEventListener('click', () => { if (!fullDataTable.innerHTML) renderFullDataTable(); exportElementAsDoc(fullDataTable, 'insightpilot-full-table.doc'); });
if (exportSelectedImageBtn) exportSelectedImageBtn.addEventListener('click', async () => { const view = renderSelectedMetricsView(); document.body.appendChild(view); await exportElementAsPng(view, 'insightpilot-selected-metrics.png'); document.body.removeChild(view); });
if (exportSelectedPdfBtn) exportSelectedPdfBtn.addEventListener('click', async () => { const view = renderSelectedMetricsView(); document.body.appendChild(view); await exportElementAsPdf(view, 'insightpilot-selected-metrics.pdf'); document.body.removeChild(view); });
if (shareSelectedBtn) shareSelectedBtn.addEventListener('click', () => {
  const selectedFields = getSelectedMetricFields();
  const dashboardData = {
    data: state.parsedData,
    headers: state.headers,
    selectedMetrics: state.selectedMetrics.filter(m => selectedFields.includes(m.field)),
    chartTypes: Object.fromEntries(Object.entries(state.chartTypes).filter(([k]) => selectedFields.includes(k))),
    creator: state.currentUser,
    createdAt: new Date().toISOString()
  };
  fallbackShare(dashboardData);
});

// Export as PDF
exportPdfBtn.addEventListener('click', async () => {
  try {
    showLoader();
    
    // Capture the dashboard area
    const dashboardElement = document.querySelector('#step5 .card');
    const canvas = await html2canvas(dashboardElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Add title page with creator info
    pdf.setFontSize(20);
    pdf.text('InsightPilot Dashboard Report', 20, 30);
    
    if (state.currentUser) {
      pdf.setFontSize(12);
      pdf.text(`Created by: ${state.currentUser.name}`, 20, 45);
      pdf.text(`Email: ${state.currentUser.email}`, 20, 55);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 65);
    }
    
    // Add dashboard image
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download PDF
    const filename = state.currentUser ? 
      `insightpilot-dashboard-${state.currentUser.name.replace(/\s+/g, '-')}.pdf` : 
      'insightpilot-dashboard.pdf';
    pdf.save(filename);
    hideLoader();
    showSuccess('PDF exported successfully!');
    
  } catch (error) {
    hideLoader();
    showError('Error generating PDF: ' + error.message);
    console.error(error);
  }
});

// Export as Image
exportImageBtn.addEventListener('click', async () => {
  try {
    showLoader();
    
    // Capture the dashboard area
    const dashboardElement = document.querySelector('#step5 .card');
    const canvas = await html2canvas(dashboardElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = state.currentUser ? 
      `insightpilot-dashboard-${state.currentUser.name.replace(/\s+/g, '-')}.png` : 
      'insightpilot-dashboard.png';
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    hideLoader();
    showSuccess('Image exported successfully!');
    
  } catch (error) {
    hideLoader();
    showError('Error generating image: ' + error.message);
    console.error(error);
  }
});

// Export Preview: PNG
document.getElementById('exportPreviewPngBtn').addEventListener('click', async () => {
  try {
    showLoader();
    const element = document.getElementById('dataPreview');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true });
    const link = document.createElement('a');
    link.download = 'insightpilot-preview.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    hideLoader();
    showSuccess('Preview exported as image!');
  } catch (error) {
    hideLoader();
    showError('Error exporting preview image: ' + error.message);
  }
});

// Export Preview: PDF
document.getElementById('exportPreviewPdfBtn').addEventListener('click', async () => {
  try {
    showLoader();
    const element = document.getElementById('dataPreview');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 295;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 295;
    }
    pdf.save('insightpilot-preview.pdf');
    hideLoader();
    showSuccess('Preview exported as PDF!');
  } catch (error) {
    hideLoader();
    showError('Error exporting preview PDF: ' + error.message);
  }
});

// Export Preview: DOCX (simple HTML table to .doc via data URI)
document.getElementById('exportPreviewDocBtn').addEventListener('click', async () => {
  try {
    const element = document.getElementById('dataPreview');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preview</title></head><body>${element.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'insightpilot-preview.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccess('Preview exported as DOC!');
  } catch (error) {
    showError('Error exporting preview DOC: ' + error.message);
  }
});

// Shareable Link
shareLinkBtn.addEventListener('click', () => {
  // Create a shareable link with dashboard data
  const dashboardData = {
    data: state.parsedData,
    headers: state.headers,
    selectedMetrics: state.selectedMetrics,
    chartTypes: state.chartTypes,
    creator: state.currentUser,
    createdAt: new Date().toISOString()
  };
  
  // If Firestore is available, save doc and copy short link
  if (window.db) {
    window.db.collection('dashboards').add(dashboardData)
      .then(docRef => {
        const link = `${window.location.origin}${window.location.pathname}?doc=${docRef.id}`;
        return navigator.clipboard.writeText(link).then(() => link).catch(() => link);
      })
      .then(() => {
        showSuccess('Shareable link copied to clipboard!');
      })
      .catch(err => {
        console.error('Firestore error, falling back to URL encoding:', err);
        fallbackShare(dashboardData);
      });
  } else {
    fallbackShare(dashboardData);
  }
});

function fallbackShare(dashboardData) {
  const encodedData = btoa(JSON.stringify(dashboardData));
  const link = `${window.location.origin}${window.location.pathname}?view=${encodedData}`;
  navigator.clipboard.writeText(link).then(() => {
    showSuccess('Shareable link copied to clipboard!');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccess('Shareable link copied to clipboard!');
  });
}

// Refresh Data
refreshDataBtn.addEventListener('click', () => {
  showSuccess('Data refreshed! In a full version, this would check for new entries from connected sources.');
  // In a real app, this would re-fetch data from connected sources
});

// Initialize
csvFile.addEventListener('change', function() {
  if (this.files.length > 0) {
    document.querySelector('#csvUpload p').textContent = `File selected: ${this.files[0].name}`;
  }
});

docFile.addEventListener('change', function() {
  if (this.files.length > 0) {
    document.querySelector('#docUpload p').textContent = `File selected: ${this.files[0].name}`;
  }
});

// Load dashboard from URL parameters (for shareable links)
window.addEventListener('load', () => {
  // Show landing by default on first load
  if (landing) landing.style.display = 'block';
  const urlParams = new URLSearchParams(window.location.search);
  const viewData = urlParams.get('view');
  const docId = urlParams.get('doc');
  
  if (docId && window.db) {
    window.db.collection('dashboards').doc(docId).get().then(doc => {
      if (!doc.exists) throw new Error('Dashboard not found');
      const dashboardData = doc.data();
      setupViewOnly(dashboardData);
    }).catch(error => {
      console.error('Error loading Firestore dashboard:', error);
      showError('Unable to load shared dashboard. The link may be invalid or expired.');
    });
  }
  else if (viewData) {
    try {
      // Decode the dashboard data
      const dashboardData = JSON.parse(atob(viewData));
      setupViewOnly(dashboardData);
    } catch (error) {
      console.error('Error loading shared dashboard:', error);
      showError('Invalid shareable link. Please check the URL and try again.');
    }
  }
});

function setupViewOnly(dashboardData) {
  // Set up view-only mode
  state.isViewOnly = true;
  state.parsedData = dashboardData.data;
  state.headers = dashboardData.headers;
  state.selectedMetrics = dashboardData.selectedMetrics;
  state.chartTypes = dashboardData.chartTypes;
  state.currentUser = dashboardData.creator;
  
  // Update UI for view-only mode
  userDisplayName.textContent = dashboardData.creator ? dashboardData.creator.name : 'Unknown Creator';
  
  // Add view-only notice
  addViewOnlyNotice();
  
  // Skip authentication and go directly to dashboard
  goToStep(5);
  generateDashboard();
}

function addViewOnlyNotice() {
  const notice = document.createElement('div');
  notice.className = 'view-only-mode';
  notice.innerHTML = `
    <h4>👁️ View-Only Mode</h4>
    <p>You are viewing a shared dashboard. You cannot edit or modify this report.</p>
  `;
  
  // Insert at the top of the dashboard
  const dashboardCard = document.querySelector('#step5 .card');
  const dashboardHeader = document.querySelector('.dashboard-header');
  dashboardCard.insertBefore(notice, dashboardHeader);
}
