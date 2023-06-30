

        let Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            engine, world;

        let W, H, c, ctx, mouse, touch, lastTimeCalled
        let ground, left, right, marginBorder = 20, rad;
        let move = false, lastSelected = null, gamePlay = true, checkBoxAudio = true, effetBigBoom = false, pause = false;
        let circles = [], booms = [], arrBonus = [], same = []
        let nbrTime = 90, countPoints = 0, bestScore = 0, progress = 0
        const colors = ['#FF1818', '#F4E104', '#029DFF', '#E018FF']
        const srcSoundSelect = "https://lolofra.github.io/balls/audio/selected.mp3"
        const srcSoundBoom = "https://lolofra.github.io/balls/audio/sbomb.mp3"
        const srcSoundBonus = "https://lolofra.github.io/balls/audio/bonus.mp3"
        const srcSoundEnd = "https://lolofra.github.io/balls/audio/end.mp3"
        const srcSoundBigBoom = "https://lolofra.github.io/balls/audio/bigBoom.mp3"

        const random = (max = 1, min = 0) => Math.random() * (max - min) + min;

        const calcFPS = () => {
            let dt = performance.now() - lastTimeCalled;
            lastTimeCalled = performance.now()
            nbrfps.innerText = Math.round(1000 / dt);
        }

        class Ball {
            constructor(x, y, rad, bonus) {
                this.x = x;
                this.y = y;
                this.rad = rad;
                this.bonus = bonus || null
                this.mq = ~~random(colors.length)
                this.c = colors[this.mq]
                this.select = false
                this.options = { isStatic: false, friction: 0, restitution: 0 };
                this.body = Bodies.circle(this.x, this.y, this.rad, this.options)
                World.add(world, this.body);
            }
            draw() {
                if (this.select) {
                    ctx.beginPath();
                    ctx.fillStyle = this.c
                    ctx.arc(this.x, this.y, this.rad, 0, 2 * Math.PI);
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.fillStyle = this.color
                ctx.arc(this.x, this.y, this.rad - 2, 0, 2 * Math.PI);
                ctx.fill();
                if (this.bonus != null) {
                    ctx.beginPath();
                    ctx.fillStyle = 'white'
                    ctx.font = this.rad / 1.2 + "px Arial";
                    let bonus = '⭐️'
                    let w = ctx.measureText(bonus).width
                    ctx.fillText(bonus, this.x - w / 2, this.y + this.rad / 4);
                }
            }
            update() {
                this.x = this.body.position.x
                this.y = this.body.position.y
                this.color = radColor(this.x, this.y, 0, this.x, this.y, this.rad * 2, this.c)
                this.draw()
            }
        }

        class Boom {
            constructor(x, y, rad, color) {
                this.x = x
                this.y = y
                this.rad = rad
                this.color = color
                this.a = random(2 * Math.PI)
            }
            draw() {
                ctx.beginPath()
                ctx.fillStyle = this.color
                ctx.arc(this.x, this.y, this.rad, 0, 2 * Math.PI)
                ctx.fill()
                ctx.closePath()
            }
            update() {
                this.x += 2 * Math.cos(this.a)
                this.y += 2 * Math.sin(this.a)
                this.draw()
            }
        }

        class Bonus {
            constructor(x, y, sizeFont, bonus) {
                this.x = x
                this.y = y
                this.sizeFont = sizeFont
                this.color = 'white'
                this.bonus = "+ " + bonus + "s"
            }
            draw() {
                ctx.beginPath()
                ctx.font = this.sizeFont + "px Arial";
                ctx.fillStyle = 'white'
                let w = ctx.measureText(this.bonus).width
                ctx.fillText(this.bonus, this.x - w / 2, this.y);
            }
            update() {
                this.draw()
            }
        }

        const radColor = (x0, y0, r0, x1, y1, r1, c) => {
            let NG = ctx.createRadialGradient(x0, y0 - rad / 2, r0, x1, y1, r1);
            NG.addColorStop(0, c);
            NG.addColorStop(1, 'black');
            return NG;
        };

        const createMatter = () => {
            engine = Engine.create();
            world = engine.world;
            Matter.Runner.run(engine);
            ground = Bodies.rectangle(W / 2, H - 20, W, 40, { isStatic: true });
            left = Bodies.rectangle(0, H / 2, marginBorder, H * 4, { isStatic: true });
            right = Bodies.rectangle(W, H / 2, marginBorder, H * 4, { isStatic: true });
            World.add(world, [ground, left, right]);
        }

        const createCircles = () => {
            rad = W / 12
            for (let x = marginBorder + rad; x < W - rad - marginBorder; x += rad * 2) {
                for (y = rad; y < H - rad; y += rad * 2) {
                    circles.push(new Ball(x, y, rad))
                }
            }
        }

        const checkSelect = () => {
            for (let i = 0; i < circles.length; i++) {
                let d = Math.hypot(mouse.x - circles[i].x, mouse.y - circles[i].y)
                if (d < circles[i].rad && !circles[i].select) {
                    if (same.length > 0) {
                        let d1 = Math.hypot(circles[lastSelected].x - circles[i].x, circles[lastSelected].y - circles[i].y)
                        if (d1 < circles[i].rad * 2.2 && circles[i].mq == circles[lastSelected].mq) {
                            if (checkBoxAudio) {
                                createjs.Sound.play('soundball')

                            }
                            lastSelected = i
                            same.push(i)
                            circles[i].select = true
                            let r = circles[i].rad
                            circles[i].rad *= 1.2
                            setTimeout(() => {
                                circles[i].rad = r
                            }, 100)
                        }
                    }
                    else {
                        if (checkBoxAudio) {
                            createjs.Sound.play('soundball')
                        }
                        lastSelected = i
                        same.push(i)
                        circles[i].select = true
                        let r = circles[i].rad
                        circles[i].rad *= 1.2
                        setTimeout(() => {
                            circles[i].rad = r
                        }, 100)
                    }
                }
            }
        }

        const drawBorder = () => {
            ctx.beginPath();
            ctx.fillStyle = 'rgb(40,40,40)'
            ctx.rect(0, H - 40, W, 40);
            ctx.rect(0, 0, 10, H);
            ctx.rect(W - 10, 0, 10, H);
            ctx.fill();
        }

        const updateBalls = () => {
            for (let i = 0; i < circles.length; i++) {
                circles[i].update()
            }
        }

        const newBall = (n) => {
            let l, luck = ~~random(2)
            if (luck % 2 == 0) l = ~~random(n)
            for (let i = 0; i < n; i++) {
                if (l == i) circles.push(new Ball(W / 2, random(-20, -100), rad, ~~random(7, 1)))
                else circles.push(new Ball(W / 2, random(-20, -100), rad))
            }
        }

        const checkBoom = () => {
            let sameLength = same.length
            let getBonus = false
            if (sameLength > 2) {
                for (let i = circles.length - 1; i >= 0; i--) {
                    if (circles[i].select == true) {
                        if (circles[i].bonus != null) {
                            getBonus = true
                            nbrTime += circles[i].bonus
                            arrBonus.push(new Bonus(circles[i].x, circles[i].y, circles[i].rad, circles[i].bonus))
                        }
                        for (let n = 0; n < 10; n++) {
                            booms.push(new Boom(circles[i].x, circles[i].y, circles[i].rad / 2, colors[circles[i].mq]))
                        }
                        Matter.World.remove(world, circles[i].body);
                        circles.splice(i, 1);
                    }
                }
                if (sameLength > 7) {
                    nbrTime += 10
                    arrBonus.push(new Bonus(W / 2, H / 2, rad * 2, 10))
                    effetBigBoom = true
                    setTimeout(() => {
                        effetBigBoom = false
                        progress = 0
                    }, 2000)
                }
                if (getBonus) {
                    timegame.style.color = "#37DE00"
                    timegame.style.fontSize = "2em"
                    setTimeout(() => {
                        timegame.style.color = "white"
                        timegame.style.fontSize = "1.5em"
                    }, 300)
                }
                newBall(sameLength)
                countPoints += sameLength
                info.innerText = countPoints
                if (checkBoxAudio) {
                    if (sameLength > 7) {
                        createjs.Sound.play('soundbigboom')
                    }
                    else {
                        createjs.Sound.play('soundboom')
                    }
                    if (getBonus) {
                        createjs.Sound.play('soundbonus')
                    }
                }
            }
            reInitVar()
        }

        const animBooms = () => {
            for (let i = booms.length - 1; i >= 0; i--) {
                booms[i].update()
                booms[i].rad -= 0.5
                if (booms[i].rad <= 0.6) booms.splice(i, 1);
            }
        }

        const animBonus = () => {
            for (let i = arrBonus.length - 1; i >= 0; i--) {
                arrBonus[i].update()
                arrBonus[i].sizeFont -= 0.5
                arrBonus[i].y -= 1
                if (arrBonus[i].sizeFont <= 10) arrBonus.splice(i, 1);
            }
        }

        const blastRings = (x, y, radius, lw, color) => {
            if (radius < 0) radius = 0;
            ctx.beginPath();
            ctx.lineWidth = lw;
            ctx.strokeStyle = color;
            ctx.arc(x, y, radius + 30, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        const blastStar = (x, y, sizeFont, a) => {
            this.x = x + progress / 2 * Math.cos(a)
            this.y = y + progress / 2 * Math.sin(a)
            ctx.beginPath();
            ctx.font = sizeFont + "px Arial";
            ctx.fillStyle = 'white'
            ctx.fillText('⭐️', this.x, this.y);
        }

        const createEffet = () => {
            progress += 15;
            blastRings(W / 2, H / 2, progress, 10, "white");
            blastRings(W / 2, H / 2, progress - 30, 15, "yellow");
            blastRings(W / 2, H / 2, progress - 50, 20, "orange");
            blastRings(W / 2, H / 2, progress - 100, 30, "red");
            for (let i = 0; i < Math.PI * 2; i += Math.PI / 8) {
                blastStar(W / 2, H / 2, rad, i)
            }
        }

        const reInitVar = () => {
            firstSelected = null
            lastSelected = null
            same = []
            circles.map(x => x.select = false)
        }

        const timePass = () => {
            if (!pause) nbrTime--
            if (nbrTime < 1) {
                if (gamePlay) {
                    endGame()
                    gamePlay = false
                }
            }
            else {
                let m = Math.floor(nbrTime / 60)
                let s = nbrTime % 60
                if (s < 10) s = "0" + s
                if (m > 0) timegame.innerText = m + " : " + s
                else timegame.innerText = s
            }
        }

        const newGame = () => {
            reInitVar()
            nbrTime = 90
            countPoints = 0
            info.innerText = countPoints
            World.clear(world);
            Engine.clear(engine);
            circles = []
            createMatter()
            createCircles()
            createBonus()
            gamePlay = true
        }

        const endGame = () => {
            if (checkBoxAudio) {
                createjs.Sound.play('soundend')
            }
            endgame.style.display = "flex"
            bestScore = countPoints > bestScore ? countPoints : bestScore
            score.innerText = "Your score : " + countPoints
            bestscore.innerText = "Best score : " + bestScore
        }

        function restart() {
            endgame.style.display = "none"
            newGame()
        }

        const createBonus = () => {
            let n = ~~(circles.length / 10)
            for (let i = 0; i < n; i++) {
                circles[~~random(circles.length)].bonus = ~~random(7, 1)
            }
        }

        const loadAudio = () => {
            createjs.Sound.registerSound(srcSoundSelect, 'soundball');
            createjs.Sound.registerSound(srcSoundBoom, 'soundboom');
            createjs.Sound.registerSound(srcSoundBonus, 'soundbonus');
            createjs.Sound.registerSound(srcSoundEnd, 'soundend');
            createjs.Sound.registerSound(srcSoundBigBoom, 'soundbigboom');
        }

        const initWidthHeight = () => {
            c.width = W = innerWidth
            c.height = H = innerHeight
            if (innerWidth > innerHeight) {
                c.width = W = innerHeight * 0.6
                container.style.width = W + "px"
            }
        }

        const init = () => {
            c = document.getElementById("canvas");
            initWidthHeight()
            ctx = canvas.getContext("2d")
            loadAudio()
            createMatter()
            createCircles()
            createBonus()
            eventsListener()
            requestAnimationFrame(animate)
        }

        const animate = () => {
            ctx.clearRect(0, 0, W, H)
            if (!pause) calcFPS()
            updateBalls()
            if (move && !pause) checkSelect()
            animBooms()
            animBonus()
            if (effetBigBoom) createEffet()
            drawBorder()
            requestAnimationFrame(animate)
        }

        onload = init

        const eventsListener = () => {
            mouse = {
                x: null,
                y: null
            };
            touch = {
                x: null,
                y: null
            };
            c.addEventListener("mousemove", function (event) {
                event.preventDefault();
                if (move) {
                    mouse.x = event.clientX;
                    mouse.y = event.clientY;
                }
                else {
                    mouse.x = null;
                    mouse.y = null;
                }
            });
            c.addEventListener("mousedown", function (event) {
                move = true;
                mouse.x = event.clientX;
                mouse.y = event.clientY;
            });
            c.addEventListener("mouseup", function () {
                move = false;
                mouse.x = null;
                mouse.y = null;
                checkBoom()
            });
            c.addEventListener("touchstart", function (event) {
                let touch = event.changedTouches[0];
                let touchX = parseInt(touch.clientX);
                let touchY = parseInt(touch.clientY);
                mouse.x = touchX - c.offsetLeft;
                mouse.y = touchY - c.offsetTop;
                move = true;
            });
            c.addEventListener("touchmove", function (event) {
                if (move) {
                    let touch = event.changedTouches[0];
                    let touchX = parseInt(touch.clientX);
                    let touchY = parseInt(touch.clientY);
                    mouse.x = touchX - c.offsetLeft;
                    mouse.y = touchY - c.offsetTop;
                }
            });
            c.addEventListener("touchend", function () {
                mouse.x = null;
                mouse.y = null;
                move = false;
                checkBoom()
            });
            rules.addEventListener("click", function () {
                rules.style.display = 'none'
                timePass()
                setInterval(timePass, 1000)
            });
            endgame.addEventListener("click", function () {
                restart()
            });
            checkbowaudio.addEventListener("click", function () {
                checkBoxAudio = checkBoxAudio ? false : true
                if (!checkBoxAudio) {
                    checkbowaudio.innerHTML = `<i class="fas fa-volume-mute"></i>`
                }
                else {
                    checkbowaudio.innerHTML = `<i class="fas fa-volume-up"></i>`
                }
            });
            play_pause.addEventListener("click", function () {
                pause = pause ? false : true
                if (pause) {
                    play_pause.innerHTML = `<i class="fas fa-play"></i>`
                    c.style.webkitFilter = "blur(30px)";
                }
                else {
                    play_pause.innerHTML = `<i class="fas fa-pause"></i>`
                    c.style.webkitFilter = "blur(0px)";
                }
            });

        };


    