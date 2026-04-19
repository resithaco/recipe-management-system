const users= JSON.parse(localStorage.getItem("users"))||{};
const user={
    LogIn(event){
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        if(!username || !password){
            alert("Lütfen tüm alanları doldurun")
            return;
        }
        if(users[username]){
            if(users[username].password===password){
                localStorage.setItem("username",username);
                localStorage.setItem("role",users[username].role);
                if (users[username].role==="restaurant"){
                    window.location.href="admin.html";
                } else if(users[username].role==="delivery"){
                    window.location.href="delivery.html";
                }else if(users[username].role==="user"){
                    window.location.href="user.html";
                }
            }else {
                alert("Şifre yanlış!")
            }
        }else{
            alert("bu kullanıcı bulunmadı")
        }
        document.getElementById("username").value="";
        document.getElementById("password").value="";
    },

Register(event){
    event.preventDefault();
    const newUsername = document.getElementById("newUsername").value;
    const newEmail = document.getElementById("newEmail").value;
    const newPassword = document.getElementById("newPassword").value;
    const role = document.getElementById("accountType").value;
    
    if (!newUsername||!newEmail||!newPassword||!role){
    alert("Lütfen tüm alanları doldurun");
    return;
    }
    if(users[newUsername]){
    alert("Bu kullanıcı zaten var!");
    return;
    }
    users[newUsername]={
    email:newEmail,
    password:newPassword,
    role:role,
    };
    localStorage.setItem("users",JSON.stringify(users));
    alert(" Kayıt başarlı!");
    document.getElementById("newUsername").value="";
    document.getElementById("newEmail").value="";
    document.getElementById("newPassword").value="";     document.getElementById("accountType").value="";
    flipCard();
    }
};
function flipCard(){
    document.getElementById("cardContainer").classList.toggle("flip");
}