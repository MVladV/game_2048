const btn = document.getElementById(".btn-toggle");
const theme = document.getElementById("#theme-link");
console.log(btn);
btn.addEventListener("click", function() {
    if (theme.getElementById("link").getAttribute("href") === "dark-theme.css") {
        console.log("afegy");
        theme.href = "light-theme.css";
    } else {
        theme.href = "dark-theme.css";
    }
});