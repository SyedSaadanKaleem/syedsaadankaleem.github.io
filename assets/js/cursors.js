//  const cursorTag = document.querySelector("div.cursors")
//  const ball = cursorTag.querySelector("div")

 document.addEventListener("mousemove", function(event){
 ball.style.left = event.pageX + "px"
 ball.style.top = event.pageY + "px"
 })



 //site-wide cursor
 const site_wide_cursor = document.querySelector('.custom-cursor.site-wide');



 document.addEventListener('mousemove',TrackCursor);

 document.addEventListener('mousedown', () => site_wide_cursor.classList.add('active'));
 document.addEventListener('mouseup', () => site_wide_cursor.classList.remove('active'));
 document.addEventListener('mousepointer', () => site_wide_cursor.classList.toggle('active'));


 function TrackCursor(evt){
     const w = site_wide_cursor.clientWidth;
     const h = site_wide_cursor.clientHeight;
     site_wide_cursor.style.transform = 'translate('+ (evt.clientX - w/2) +'px, '+ (evt.clientY - h/2) +'px)';
 }




 const cursor = document.querySelector(".cursor");
 let clickAnimationInterval;

 window.addEventListener("mousemove", (e) => {
   cursor.style.left = e.pageX + "px";
   cursor.style.top = e.pageY + "px";
   cursor.setAttribute("data-fromTop", cursor.offsetTop - scrollY);
 });

 window.addEventListener("scroll", () => {
   const fromTop = cursor.getAttribute("data-fromTop");
   cursor.style.top = scrollY + parseInt(fromTop) + "px";
   console.log(scrollY);
 });

 window.addEventListener("click", () => {
   triggerRingAnimation();
});

 function triggerClickAnimation() {
   if (cursor.classList.contains("click")) {
     cursor.classList.remove("click");
     void cursor.offsetWidth; // trigger a DOM reflow
     cursor.classList.add("click");
   } else {
     cursor.classList.add("click");
   }
 }

 function triggerRingAnimation() {
   cursor.classList.add("ring");
   setTimeout(() => {
     cursor.classList.remove("ring");
     stopClickAnimationLoop();
   }, 300); // Adjust timeout to match the transition duration
 }

 function startClickAnimationLoop() {
   if (!clickAnimationInterval) {
     // Trigger the initial animation immediately
    triggerClickAnimation();
     // Set up the interval for subsequent animations
     clickAnimationInterval = setInterval(triggerClickAnimation, 500);
   }
 }

 function stopClickAnimationLoop() {
   clearInterval(clickAnimationInterval);
   clickAnimationInterval = null;
   cursor.classList.remove("click"); // Ensure the click class is removed when stopping the animation
 }

  document.addEventListener('mouseenter',()=>{
      cursor.style.display = 'block';
  });

  document.addEventListener('mouseleave',()=>{
      cursor.style.display = 'none';
  });

  // document.addEventListener('scroll',()=>{
  //   stopClickAnimationLoop();
  // });

 // Delegated so links/buttons added after load (e.g. the slider's game cards) get it too.
 const HOVER_TARGETS = 'a, button, .toggle-btn, input[type="submit"], input[type="reset"], input[type="button"]';
 document.addEventListener('mouseover', (e) => {
   if (e.target.closest(HOVER_TARGETS)) startClickAnimationLoop();
 });
 document.addEventListener('mouseout', (e) => {
   const el = e.target.closest(HOVER_TARGETS);
   if (el && !el.contains(e.relatedTarget)) stopClickAnimationLoop();
 });


const banner = document.querySelector('.video-banner');
console.log('Banner found:', banner);
console.log('startClickAnimationLoop is:', typeof startClickAnimationLoop);

if (banner && typeof startClickAnimationLoop === 'function') {
    banner.addEventListener('mouseenter', () => {
        console.log('Banner mouseenter fired!');
        startClickAnimationLoop();
    });
    banner.addEventListener('mouseleave', () => {
        console.log('Banner mouseleave fired!');
        stopClickAnimationLoop();
    });
    console.log('Listeners attached manually. Try hovering now.');
} else {
    console.log('Something is missing.');
}

 const cursorTag = document.querySelector("div.cursor")
 const balls = cursorTag.querySelectorAll("div")

 let aimX = 0
 let aimY = 0

 balls.forEach((ball, index) => {
 let currentX = 0
 let currentY = 0
 let speed= 0.3 - index * 0.015

 const animate = function () {
 currentX += (aimX - currentX) * speed
 currenty += (aimY - currentY)* speed
 ball.style.left = currentX + "px"
 ball.style.top = currentY + "px"
 requestAnimationFrame (animate)
 }
 animate()
 })
 document.addEventListener("mousemove", function (event) {

 aimX= event.pageX
 aimY= event.pageY
 })





 