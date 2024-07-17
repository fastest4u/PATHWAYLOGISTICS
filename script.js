
function checkLogin(userId) {
    Url = "https://sheet.best/api/sheets/b1628384-d498-4a3e-819f-fb58c139df2a/tabs/users/userId/"
    fetch(Url + userId)
  .then((response) => response.json())
  .then((data) => {
    return data[0]
  })
  .catch((error) => {
    console.error(error);
  });
            
        
}

userId = "Ueba4de51638f6d4e11c70448cf1762d1"

checkLogin(userId)