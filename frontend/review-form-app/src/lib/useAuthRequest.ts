const useAuthRequest = () => {
    // Return a mock session - no login needed
    return {
      user: {
        id: "service-provider-1",
        email: "provider@example.test",
        name: "Demo Service Provider"
      }
    };
  };

  export default useAuthRequest;