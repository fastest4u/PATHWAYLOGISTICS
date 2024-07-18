

document.addEventListener("DOMContentLoaded", () => {
  main();


});
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
        displayName: profile.displayName,
      };
      const userId = await checkLogin(profile.userId);
      console.log(userId);
      if (userId) {
        sessionStorage.setItem("userData", JSON.stringify(userId));

      } else {
       
        let status = await signup();
        if (status) {
          await registerUser(profileData);
          
        }
        let title = `${profile.displayName}  \n ยังไม่ได้ลงทะเบียน \n กรุณาลงทะเบียนก่อนใช้งาน`;
        displayNotification(title, "warning");
        
        
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
    if (response.ok) {
      displayNotification("ลงทะเบียนสำหรับการใช้งานเรียบร้อย", "success");
      setTimeout(() => {
        Swal.close();
      }, 1000);
      return ;
    }else{
      displayNotification("ลงทะเบียนไม่สำหรับการใช้งาน", "error");
      setTimeout(() => {
        Swal.close();
      }, 1000);
      return ;
    }



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





async function displayNotification(message, alertClass) {
  Swal.fire({
    icon: alertClass,
    title: message,
    showConfirmButton: false,
    timerProgressBar: true,
    didOpen: () => {
      if (alertClass === "warning") {
        Swal.showLoading();
        setTimeout(() => {
          Swal.close();
        }, 3000);
      }
    }
  });
}






async function signup() {
  const Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/Signup`;
  try {
    const response = await fetch(Url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const res = await response.json();
    return res[0].Signup;
  } catch (error) {
    throw error;
  }



}













