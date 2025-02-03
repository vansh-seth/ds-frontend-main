import React, {useEffect, useState} from 'react';
const NetworkBackground = () => {
    const canvasRef = React.useRef();
  
    React.useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      let animationFrameId;
  
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
  
      const nodes = [];
      const nodeCount = 30; // Reduced number of nodes
      const connectionDistance = 150;
      const cursorConnectionDistance = 200;
  
      let mouse = {
        x: undefined,
        y: undefined,
      };
  
      class Node {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = 2;
          this.speedX = (Math.random() - 0.5) * 2;
          this.speedY = (Math.random() - 0.5) * 2;
        }
  
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
  
          if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
          if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
  
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
          ctx.fill();
        }
      }
  
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
      }
  
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].update();
          nodes[i].draw();
  
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
  
            if (distance < connectionDistance) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / connectionDistance})`;
              ctx.stroke();
            }
          }
  
          if (mouse.x && mouse.y) {
            const dx = nodes[i].x - mouse.x;
            const dy = nodes[i].y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
  
            if (distance < cursorConnectionDistance) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / cursorConnectionDistance})`;
              ctx.stroke();
            }
          }
        }
  
        animationFrameId = requestAnimationFrame(animate);
      };
  
      animate();
  
      const handleMouseMove = (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      };
      window.addEventListener("mousemove", handleMouseMove);
  
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("mousemove", handleMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    }, []);
  
    return (
      <canvas
        ref={canvasRef}
        style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }}
      />
      );
    }; 
    export default NetworkBackground;