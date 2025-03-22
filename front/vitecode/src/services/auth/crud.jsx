const fetchProfile = async () => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      try {
        const response = await fetch('http://localhost:1337/profiles/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
        });
  
        const data = await response.json();
        console.log('User Profile:', data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
  };