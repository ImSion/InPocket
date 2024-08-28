import React, { useEffect, useRef } from 'react';

// Componente principale per lo sfondo con onde
const WaveBackground = () => {
  // Crea un riferimento al canvas
  const canvasRef = useRef(null);

  // useEffect per gestire l'animazione e il ridimensionamento
  useEffect(() => {
    // Ottiene il riferimento al canvas
    const canvas = canvasRef.current;
    // Ottiene il contesto 2D per disegnare
    const ctx = canvas.getContext('2d');
    // Variabile per tenere traccia dell'ID dell'animazione
    let animationFrameId;

    // Funzione per ridimensionare il canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Funzione per disegnare un'onda diagonale
    const drawDiagonalWave = (offset, color) => {
        ctx.beginPath();
        // Modifica il punto di partenza per coprire più area
        ctx.moveTo(0, canvas.height * 0.3); // Inizia al 30% dall'alto
      
        // Crea i punti dell'onda
        for (let i = 0; i <= canvas.width + canvas.height; i++) {
          const x = i;
          // Modifica questa riga per aumentare l'area coperta e spostare l'onda
          const y = canvas.height * 0.8 - i * (canvas.height * 0.8 / canvas.width) +
                    Math.sin(i * 0.01 + offset) * 50 +
                    Math.sin(i * 0.02 + offset * 1.1) * 20;
          ctx.lineTo(x, y);
        }
        
        // Modifica questi punti per completare il percorso dell'onda
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = color;
        ctx.fill();
    };

    // Funzione di animazione principale
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Colore base per le onde
      const baseColor = [100, 80, 255];
      const time = Date.now() * 0.001;
      
      // Disegna due onde con diversi offset e opacità
      drawDiagonalWave(time * 0.4, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.2)`);
      drawDiagonalWave(time * 0.7, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.3)`);

      // Richiede il prossimo frame di animazione
      animationFrameId = requestAnimationFrame(animate);
    };

    // Inizializza il canvas e avvia l'animazione
    resizeCanvas();
    animate();

    // Aggiunge un listener per il ridimensionamento della finestra
    window.addEventListener('resize', resizeCanvas);

    // Funzione di pulizia
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []); // Nessuna dipendenza, l'effetto si esegue solo al montaggio del componente

  // Renderizza il canvas
  return <canvas 
    className='bg-white dark:bg-black'
    ref={canvasRef} 
    style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%',
      height: '100%', 
      zIndex: -1
    }} 
  />;
};

export default WaveBackground;