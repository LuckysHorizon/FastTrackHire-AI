export const COMPANY_LOGOS = {
  Google: {
    logo: '/company-assets/Google_Favicon_2025.svg.webp',
    color: '#4285F4'
  },
  Amazon: {
    logo: '/company-assets/amazon_logo.png',
    color: '#FF9900'
  },
  Microsoft: {
    logo: '/company-assets/microsoft.png',
    color: '#00A4EF'
  },
  Apple: {
    logo: '/company-assets/apple.png',
    color: '#555555'
  },
  Meta: {
    logo: '/company-assets/Meta-Logo.png',
    color: '#0082FB'
  },
  Netflix: {
    logo: '/company-assets/netflix_logo.webp',
    color: '#E50914'
  }
};

export const getCompanyLogo = (companyName) => {
  return COMPANY_LOGOS[companyName]?.logo || null;
};
