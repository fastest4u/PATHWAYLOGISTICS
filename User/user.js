


function logOut() {
    liff.logout();
    window.location.reload();
}

async function loaddata(event) {
    event.preventDefault();

    displayNotification("กำลังค้นหาข้อมูล", "warning");
    let input = document.getElementById("searchInput").value;
    let Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/Transportation/%E0%B8%9A%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B9%82%E0%B8%84%E0%B9%89%E0%B8%94/${input}`;

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
                setTimeout(() => {
                    Swal.close();
                }, 3000);
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

        const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
        modal.show();
        document.getElementById('date').value = result.date;
        document.getElementById('route').value = result.route;
        document.getElementById('barcode').value = result.barcode;
        document.getElementById('company').value = result.company.split(' ')[0];
        document.getElementById('driver').value = result.driver;
        document.getElementById('price').value = price;
        Swal.close();
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
        if (res.length === 0) {
            return "ยังไม่ได้แจ้งราคา";
        }
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
    let Url = "https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/Transportation";
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
            document.getElementById("dataForm").reset();
            setTimeout(() => {
                Swal.close();
            }, 1000);
        } else {
            displayNotification("บันทึกข้อมูลไม่สําเร็จ", "error");
        }
    } catch (error) {
        console.log('There was a problem with the fetch operation:', error);
    }
}
$(document).ready(function() {
    userData = JSON.parse(sessionStorage.getItem("userData"));
    if (userData) {
        $('#userImage').attr('src', userData.pictureUrl);
       
    }

    // เช็คการเข้าสู่ระบบ
    if (!userData) {
        console.log("Not logged in");
        window.location.href = "../";
        return;
    }
    // เช็คสิทธิ์การใช้งาน
    if (userData.rules == "admin") {
        window.location.href = "Admin/admin.html";
    }

    // เรียกใช้ฟังก์ชัน tableUser
    tableUser(userData);
});


function tableUser(userData) {
    
        // Retrieve user data from session storage
      console.log(userData.Fullname);
        
        // Define the API URL dynamically using the user's full name
        let Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/Transportation/search?%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%81%E0%B8%B2%E0%B8%A3=${userData.Fullname}&payment=FALSE`;
        
        // Initialize the DataTable
        $('#datatable').DataTable({
            "autoWidth": false,
            "responsive": true,
            "processing": true,
            "serverSide": false, // Set to true if you want server-side processing
            "ajax": {
                "url": Url,
                "type": "GET",
                "dataSrc": function(json) {
                    return json;
                }
            },
            "columns": [
                { "data": "ลำดับ" },
                { "data": "วันที่" },
                { "data": "เส่นทาง" },
                { "data": "บาร์โค้ด" },
                { "data": "บริษัทขนส่ง" },
                { "data": "พนักงานขับรถ" },
                { "data": "ราคา" },
                { "data": "ยอดเบิก" },
                { "data": "คงเหลือ" },
                { "data": "สถานะ" }
            ],
            "columnDefs": [
                { visible: false, targets: 0 },
                {
                    targets: 9, // Targets the seventh column (Action)
                    render: data => {
                      if (data == 'อนุมัติ'){
                        
                        var icon = 'fa-regular fa-circle-check'
                        var iconColor = 'color: var(--bs-success);'
                        
                        
                      }else if (data == 'รออนุมัติ'){
                        var icon = 'fa-solid fa-circle-exclamation';
                        var iconColor = 'color: var(--bs-warning);';  // Changed to warning color
                      }else if (data == 'ไม่อนุมัติ'){
                         var icon = 'fa-regular fa-circle-xmark'
                         var iconColor = 'color: var(--bs-danger);';
                      }else {
                        var icon = 'fa-solid fa-sack-dollar'
                        var iconColor = 'color: var(--bs-primary);'
          
          
                      }
          
                      
                      if (data == 'TRUE'){
                        return data = '<a href="#" onclick="withdraw(this)" >เบิกน้ำมัน</a>';
                      } else {
                        return data = '<i class="' + icon + '" style="' + iconColor + '"> <span style="font-size: 0.75rem;">'+data+' </span>';
                      }
                  }
                  }
                
             
            ],
            "paging": true,
            "lengthMenu": [10, 25, 50, 100],
            "pageLength": 10,
            "searching": true,
            "ordering": true,
            order:[[0,'desc']],
            "info": true,
        });
    
}


function withdraw(el) {
    const token = '6nfftj49FYnm03r3FX35Bf9Ldm3hc7yYvjmr0hwW4NY';
    const tablUser = $('#datatable').DataTable();
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    let Url = `https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/`;
    let rowData = tablUser.row(el.parentNode.parentNode).data();
    let cleanedValue = rowData.ราคา.replace(/[^\d.-]/g, '');
    let formData = {
        วันที่เบิก: date(),
        ผู้ขอเบิก: rowData.ผู้ดำเนินการ,
        สถานะ: "รออนุมัติ",
        บาร์โค้ด: rowData.บาร์โค้ด,
        เส้นทาง: rowData.เส่นทาง,
        จำนวนเงิน: parseInt(cleanedValue / 2),
    };
    const myHeaders = new Headers({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    });
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };
    console.log(formData);
    Swal.fire({
        title: `<h4>ยืนยันที่จะเบิกน้ำมัน</h4> <span style="font-size: 1rem;">จำนวน ${formData.จำนวนเงิน} บาท</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#d33',
        cancelButtonText: 'ยกเลิก',
        confirmButtonText: 'ตกลง',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return fetch(Url + 'Log', {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .catch(error => {
                Swal.showValidationMessage(
                    `Request failed: ${error}`
                );
            });
        }
    })
    .then(result => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: 'เบิกน้ำมันสำหรับเรียบร้อย',
                showConfirmButton: false,
                timer: 1000
            });
            fetch(Url + 'ui/userId/' + userData.userId, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                let message = `\nลงทะเบียนเบิกน้ำมัน\n`;
                for (let key in data[0]) {
                    message += `${key} : ${data[0][key]}\n`;
                }
                message+= `จำนวนเงิน : ${formData.จำนวนเงิน} บาท`;
                line(message, token)
                return             
               
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: `Request failed: ${error}`,
                });
            });
        }
    });
}

  function date(){
    let date = new Date();
  let options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  return date.toLocaleString('th-TH', options);
  
  }
  async function line(message, lineToken) {
    const url = `https://fleet-vip.vercel.app/line?message=${encodeURIComponent(message)}&lineToken=${encodeURIComponent(lineToken)}`;
  
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "multipart/form-data");
  
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
  
    try {
      const response = await fetch(url, requestOptions);
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  // ตัวอย่างการใช้งานฟังก์ชัน

  
  
  // วิธีการใช้งานฟังก์ชัน

  

  
  