const leftSidebar = document.querySelector('.leftSidebar');
const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click', (event) => {
    leftSidebar.classList.toggle('active');
    event.stopPropagation(); // Prevent the click event from bubbling up to the document
});

document.addEventListener('click', (event) => {
    if (!leftSidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
        leftSidebar.classList.remove('active');
    }
});

let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('.leftSidebar .list .list-item a');

window.onscroll = () => { 
    sections.forEach (sec => {
        let top = window.scrollY; 
        let offset = sec.offsetTop -100; 
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        

if(top >= offset && top < offset + height) {
     navLinks.forEach(links => { 
        links.classList.remove('active'); 
            document.querySelector('.leftSidebar .list .list-item a[href*=' + id + ']').classList.add('active');
            

});
}
});
};

