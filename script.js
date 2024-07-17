document.addEventListener("DOMContentLoaded", () => {
    function logOut() {
      liff.logout();
      window.location.reload();
    }
  
    function logIn() {
      liff.login({ redirectUri: window.location.href });
    }
  
    async function main() {
      try {
        await liff.init({ liffId: "2005784883-MqXYJ2vW" });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          const profileData = {
            userId: profile.userId,
            pictureUrl: profile.pictureUrl,
          };
          const userId = await checkLogin(profile.userId);
          console.log(userId);
          if (userId) {
            sessionStorage.setItem("userData", JSON.stringify(userId));
            const formLogin = document.getElementById("form-login");
            if (formLogin) {
              formLogin.style.display = "none";
            } else {
              console.error("Element with id 'form-login' not found");
            }
          } else {
            console.log("ยังไม่ได้ลงทะเบียน");
            // Optionally, you can call registerUser(profileData) here if you want to register new users automatically.
          }
        } else {
          console.log("Not logged in");
        }
      } catch (error) {
        console.error('LIFF initialization failed', error);
      }
    }
  
    async function registerUser(userData) {
      const apiUrl = "https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/users";
      const requestOptions = {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      };
  
      try {
        const response = await fetch(apiUrl, requestOptions);
        return await response.json();
      } catch (error) {
        console.error(error);
      }
    }
  
    async function checkLogin(userId) {
      const Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/users/userId/${userId}`;
      try {
        const response = await fetch(Url);
        const data = await response.json();
        return data[0] || null;
      } catch (error) {
        console.error(error);
      }
    }
  
    main();
  });
  