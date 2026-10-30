// All copy and facts for the site. Edit here; components only lay it out.

export const site = {
  profile: {
    name: 'Ezra Kiplimo',
    fullName: 'Ezra Kiplimo Kipruto',
    role: 'Machine Learning Scientist · GIS · Statistician',
    pitch:
      'I teach models to turn noise into rainfall forecasts for the Greater Horn of Africa, and map who is most at risk when the rain fails or floods.',
    org: 'IGAD-ICPAC',
    location: 'Nairobi, Kenya',
    coords: '1.29°S 36.82°E',
    email: 'ezralimo548@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ezra-kiplimo-157by18267/',
    github: 'https://github.com/limoezra',
  },

  stats: [
    { value: 5, suffix: '+', label: 'years turning data into decisions' },
    { value: 11, suffix: '', label: 'countries in the forecast domain' },
    { value: 2, suffix: '', label: 'co-authored publications' },
  ],

  about: {
    paragraphs: [
      'I am a statistician by training and a machine learning scientist by trade. At IGAD-ICPAC, the climate centre for the Greater Horn of Africa, I build the models and maps behind early warnings: rainfall forecasts that are sharp enough to act on, and vulnerability profiles that show who is exposed when a drought or flood arrives.',
      'Most of my week is Python and R: cleaning large climate datasets, training and tuning models, and turning their output into maps and products people can read. I also write Python training manuals and teach them to colleagues from IGAD member states.',
    ],
    facts: [
      ['Now', 'ML Scientist, IGAD-ICPAC'],
      ['Based in', 'Nairobi, Kenya'],
      ['Studied', 'BSc Statistics, JKUAT'],
      ['Teaches', 'Python for climate data'],
    ] as [string, string][],
  },

  cgan: {
    title: 'Sharper rain from coarse forecasts',
    project: 'SEWAA · Strengthening Early Warning Systems for Anticipatory Action',
    summary:
      'Global forecasts see rain in blurry, coarse blocks. For SEWAA I retrained a conditional GAN (WGAN-GP) that takes ECMWF IFS ensemble forecasts and generates high-resolution, probabilistic rainfall for the ICPAC region, this time learning from RFE2 daily satellite rainfall instead of IMERG.',
    points: [
      '8 input channels: total precipitation, 2 m temperature, total column water vapour and surface pressure, each as ensemble mean and spread',
      'Elevation and land-sea mask as constant fields',
      'Trained on 2018–2021, tested on 2023 onwards, scored with CRPS and RMSE',
      'Rebuilt the data pipeline for daily RFE2 files, regridded cell-for-cell onto the forecast grid',
    ],
    facts: [
      ['Grid', '384 × 352 cells'],
      ['Resolution', '0.1° (~11 km)'],
      ['Domain', '11 countries'],
      ['Model', 'cGAN · WGAN-GP'],
    ] as [string, string][],
    stages: [
      { k: 10, label: '1.0°', km: '~110 km', note: 'coarse forecast' },
      { k: 5, label: '0.5°', km: '~55 km', note: 'still blurry' },
      { k: 2, label: '0.2°', km: '~22 km', note: 'structure appears' },
      { k: 1, label: '0.1°', km: '~11 km', note: 'cGAN sample' },
    ],
    repo: 'https://github.com/limoezra/SEWAA-forecasts-RFE2',
  },

  vuln: {
    title: 'Who is most at risk',
    summary:
      'Hazard maps show where a flood or drought will hit. Vulnerability profiles show who it will hurt. For the IGAD region I build drought and flood vulnerability layers from three components, then combine them into one index that feeds impact-based early warning.',
    layers: [
      { name: 'Exposure', text: 'People, livestock and assets in harm’s way.' },
      { name: 'Susceptibility', text: 'How easily they are damaged: poverty, land cover, soils.' },
      { name: 'Resilience', text: 'What helps them cope and recover.' },
      { name: 'Vulnerability', text: 'The combined index used for early action.' },
    ],
    sources: ['MODIS', 'Sentinel', 'Landsat', 'Google Earth Engine', 'CDI', 'VCI', 'ESRI soils'],
    tools: ['QGIS', 'ArcGIS', 'ArcMap', 'R tmap', 'Python'],
    points: [
      'Designed the method and framework for processing each vulnerability layer',
      'Automated collection, cleaning and normalisation in R and Python',
      'Produced high-resolution maps and full documentation for each country',
    ],
  },

  projects: [
    {
      title: 'Childhood obesity prevalence with an INAR model',
      year: '2023',
      text: 'Used an integer-valued autoregressive (INAR) model to analyse and forecast childhood obesity counts across time periods and locations, respecting the count nature of the data.',
      tags: ['R', 'Time series', 'Count models'],
    },
    {
      title: 'What drives house prices',
      year: '2023',
      text: 'Regression analysis of the factors that move house prices in a region, from size and quality to location, using a public housing dataset.',
      tags: ['Python', 'Regression', 'EDA'],
    },
    {
      title: 'E-commerce platform for GAO Tek',
      year: '2024',
      text: 'Designed and built a responsive e-commerce site for a New York company, with the product catalogue in PostgreSQL.',
      tags: ['HTML', 'CSS', 'PostgreSQL'],
    },
  ],

  publications: [
    {
      authors: 'Pfeiffer, S., Kiplimo, E., et al.',
      year: '2025',
      title:
        'Bridging the gaps: Vulnerability profiles to strengthen impact-based early warning and early action for floods and droughts in Kenya',
      venue: 'United Nations University Institute for Environment and Human Security (UNU-EHS), Bonn',
    },
    {
      authors: 'Sabiiti, G., Amdihun, A., Wekesa, K., Igbokwe, V., Kiplimo, E.',
      year: '2026',
      title: 'Towards Anticipatory Disaster Risk Financing and Index Insurance Mechanisms for Resilience Building in Eastern Africa',
      venue: 'IGAD-ICPAC',
    },
  ],

  experience: [
    {
      role: 'Machine Learning Scientist',
      org: 'IGAD-ICPAC',
      place: 'Nairobi',
      when: 'Oct 2025 – now',
      points: [
        'Develop and tune ML models for short-range to seasonal rainfall forecasting',
        'Prepare and manage large climate datasets; turn model output into visual products',
        'Write Python training manuals and train IGAD member states',
      ],
    },
    {
      role: 'GIS Analyst',
      org: 'IGAD-ICPAC',
      place: 'Nairobi',
      when: 'Oct 2024 – now',
      points: [
        'Drought and flood vulnerability layers for the IGAD region',
        'Spatial data from MODIS, Sentinel, Landsat and GEE; automation in R and Python',
      ],
    },
    {
      role: 'Data Contributor',
      org: 'DataForce',
      place: 'Remote',
      when: 'Aug 2024 – now',
      points: ['Data collection and quality assurance; finished a major collection project two days early'],
    },
    {
      role: 'Field Data Officer',
      org: 'Ministry of Labour, Government of Kenya',
      place: 'Kenya',
      when: 'May – Jul 2024',
      points: ['Enhanced Single Registry: collected and verified household data for vulnerable communities'],
    },
    {
      role: 'Data Intern, Statistician',
      org: 'County Government of Elgeyo Marakwet',
      place: 'Iten',
      when: 'May – Aug 2023',
      points: ['Cleaned and analysed county data in R; tracked CIDP indicators'],
    },
    {
      role: 'Clerk',
      org: 'Independent Electoral and Boundaries Commission',
      place: 'Kenya',
      when: 'Aug – Sep 2022',
      points: ['Voter verification, ballot counting and results transmission'],
    },
    {
      role: 'Data Analyst',
      org: 'Upwork',
      place: 'Remote',
      when: 'Dec 2020 – Feb 2021',
      points: ['Cleaned and analysed client data with Python, R, SQL and Excel'],
    },
  ],

  education: [
    { title: 'BSc Statistics', org: 'Jomo Kenyatta University of Agriculture and Technology', when: '2020 – 2024' },
    { title: 'Data Analysis and Visualization', org: 'freeCodeCamp', when: '2024' },
    { title: 'Software Development', org: 'JKUAT Enterprises', when: '2023' },
  ],

  certifications: [
    'Earth System Modelling · ECMWF',
    'GIS in Conservation Mapping · RCMRD',
    'Weather and climate partnerships · WISER',
    'Data visualisation job simulation · Tata Group',
    'Web3 Technology and Design · Rise In',
  ],

  toolbox: [
    { group: 'Machine learning', items: ['TensorFlow / Keras', 'cGAN · WGAN-GP', 'scikit-learn', 'Probabilistic forecasting'] },
    { group: 'Geospatial', items: ['QGIS', 'ArcGIS / ArcMap', 'Google Earth Engine', 'Sentinel · MODIS · Landsat', 'NetCDF', 'R tmap'] },
    { group: 'Data & statistics', items: ['Python', 'pandas · NumPy', 'R · dplyr', 'SQL · PostgreSQL', 'Excel'] },
    { group: 'Visualisation', items: ['Matplotlib', 'ggplot2', 'Tableau', 'Power BI'] },
  ],
};
