

document.addEventListener("DOMContentLoaded", () => {

  userData = JSON.parse(sessionStorage.getItem('userData'));
  if (userData) {
    console.log(userData);
    $("#page-login").hide();
  }
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


async function loaddata(event) {
  event.preventDefault();

  displayNotification("กำลังค้นหาข้อมูล", "warning");
  let input = document.getElementById("searchInput").value;
  Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/Transportation/%E0%B8%9A%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B9%82%E0%B8%84%E0%B9%89%E0%B8%94/${input}`

  try {
    let response = await fetch(Url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    let res = await response.json();
    console.log(res);


    let title = `ใบงาน ${input} \n ถูกบันทึกไปแล้ว`;
    if (res[0]) {
      displayNotification(title, "error");
      document.getElementById("searchInput").value = '';
      setTimeout(() => {
        Swal.close();
      }, 1000);
      return;
    }
    fetchapi(input);
  } catch (error) {
    console.error('Error:', error);
    displayNotification("เกิดข้อผิดพลาดในการค้นหาข้อมูล", "error");
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
      }
    }
  });
}
async function fetchapi(barcode) {
  let url = "https://fleet-vip.vercel.app/api/decode/";

  const myHeaders = new Headers();
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(url + barcode, requestOptions);
    const result = await response.json();
    if (response.status === 200) {

      if (result.actual_departure_time.length === 0 && result.actual_arrival_time.length === 0) {
        Swal.close();
        displayNotification("ไม่ได้วิ้งงาน", "error");
        document.getElementById("searchInput").value = '';
        setTimeout(() => {
          Swal.close();
        }, 1000);
        return;
      }

    } else {
      Swal.close();
      displayNotification("บาร์โค้ดไม่ถูกต้อง", "error");
      document.getElementById("searchInput").value = '';
      setTimeout(() => {
        Swal.close();
      }, 1000);

      return;


    }

    const price = await checkPrice(result.route);


    // หลังจากได้ price มาแล้ว สามารถใช้ได้ที่นี่
    const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
    modal.show();
    // // Update elements with the fetched data
    document.getElementById('date').value = result.date;
    document.getElementById('route').value = result.route;
    document.getElementById('barcode').value = result.barcode;
    document.getElementById('company').value = result.company.split(' ')[0];
    document.getElementById('driver').value = result.driver;
    document.getElementById('price').value = price;
    Swal.close();
    // Close notification when data is found


  } catch (error) {


    console.error('Error:', error);
  }
}


async function checkPrice(route) {
  const Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/price/route/${route}`;
  try {
    const response = await fetch(Url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const res = await response.json();
    return res[0].price;
  } catch (error) {
    throw error;
  }
}

async function submitForm(obj, event) {
  displayNotification("กำลังบันทึกข้อมูล", "warning");

  event.preventDefault();
  let formData = {
    วันที่: obj.date.value,
    เส่นทาง: obj.route.value,
    บริษัทขนส่ง: obj.company.value,
    บาร์โค้ด: obj.barcode.value,
    พนักงานขับรถ: obj.driver.value,
    ราคา: obj.price.value,
    ผู้ดำเนินการ: userData.Fullname,
    แพนก: userData.department
  }
  Url = "https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/Transportation"
  try {
    const response = await fetch(Url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      displayNotification("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
      document.getElementById("searchInput").value = '';
      document.getElementById("dataForm").reset()
      setTimeout(() => {
        Swal.close();

      }, 1000);
      return

    } else {
      displayNotification("บันทึกข้อมูลไม่สําเร็จ", "error");
    }
  } catch (error) {
    // Errors are reported there
    console.log('There was a problem with the fetch operation:', error);
  }
}













