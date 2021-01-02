import CanvasGame from "./canvasGame.js";
import { loadImage, squareSize, Direction, SquarePosition } from "./tools.js";

// If you want to gather clues from the source code, you're not it the right file.
console.log("ko");

class InfosGame extends CanvasGame {

    private sprites: HTMLImageElement;
    private spritesDescription = {
        infosHouse: {x: 0, y: 0, width: 12, height: 11},
        wallBottom: { x: 0, y: 11, width: 1, height: 1},
        groomClothes: { x: 1, y: 11, width: 1, height: 2 },
        brideClothes: { x: 2, y: 11, width: 1, height: 2},
        groom: { x: 1, y: 13, width: 1, height: 2}, 
        bride: { x: 2, y: 13, width: 1, height: 2},
    };

    private exitHouseOverlayOpacity = 0;
    private redirected = false;

    private patterns: { [key:string] : CanvasPattern };

    private middleSprites = [
        {x:2, y: -3, desc: this.spritesDescription.groomClothes},
        {x:3, y: -2, desc: this.spritesDescription.groom},
        {x:4, y: -2, desc: this.spritesDescription.bride},
        {x:5, y: -3, desc: this.spritesDescription.brideClothes},
    ];

    /**
     * The constructor
     */
    constructor() {
        super();
        this.playerPosition.direction = Direction.Up;

        this.dialogItems = [
            {
                x:-1,
                y: -1,
                link: "https://www.facebook.com/Loretchateaux/",
                dialog: `Bonjour, je m'appelle Laure et c'est moi qui ai aidé Aurélie et Jérémy dans la conception de leur mariage. 

                Mon rôle le jour de leur mariage sera :
                
                - de décorer la salle en créant une ambiance inoubliable, 
                - de veiller au bon déroulement de la journée
                - d'être présente pour les mariés.`
            },
            
            /*mayor*/
            {
                x:-1,
                y: -3,
                link: "/Home/TownHallBook",
                dialog: `Aurélie et Jérémy vous donnent rendez-vous à la mairie d'Olivet 

                📆 le Samedi 08 août à 14h45
                📍 283 rue du Général-de-Gaulle
                45160 Olivet

                Suite à la crise sanitaire du COVID 19, la mairie n'accepte pour le moment que 25 invités à la cérémonie civile. 
                
                Merci d'avoir patienté, j'ai enfin terminé d'écrire le livre sur leur mariage à consulter en cliquant sur le bouton "Site Web".`
            },
            
            /*alliances*/
            {
                x:-1,
                y: -4,
                dialog: `Pour notre mariage nous avons voulu quelque chose qui sortait de l'ordinaire, nous avons donc choisi de prendre des gourmettes et non des bagues. 

                Ces gourmettes ont été achetées et gravées par la bijoueterie Marc Orian.`
            },
            
            /*florist*/
            {
                x:-1, 
                y: -5,
                link: "https://www.facebook.com/fleuriste.orleans.alafeeviolette/",
                dialog: `Les compositions florales de notre mariage seront réalisées par "A la fée violette". 

                N'hésitez pas à découvrir son univers et sa créativité.`
            },

            /*de lorean*/
            {
                x:0,
                y: -7,
                link: "/Home/Roadmap2",
                dialog: `Eh non, malheureusement pour Aurélie et Jérémy, cette voiture n'est pas contractuelle.

                Ils vous donneront néanmoins rendez-vous au "Domaine de la Devantière" à La Ferté-Saint-Aubin pour la suite des festivités.
                
                Cliquez sur le bouton "Site web" pour accéder au NOUVEAU plan imprimable "Olivet -> La Ferté-Saint-Aubin", qui évite les travaux !`
            },
            
            /*camera*/
            {
                x:2,
                y: -7,
                dialog: `Clic clac, c'est dans la boîte ! 

                Le jour du mariage d'Aurélie et Jérémy je serais en première ligne pour prendre les meilleurs clichés du plus beau jour de leur vie !`
            },
            
            /*photograph*/
            {
                x:3,
                y: -7,
                link: "https://www.aperturemindp.com/",
                dialog: `Bonjour, moi c'est Benjamin (Benji pour les intimes). 

                Je suis le meilleur ami d'Aurélie et également photographe professionnel, c'est tout naturellement qu'Aurélie et Jérémy m'ont choisit pour faire les photos de leur mariage. 
                
                Le jour J, je m'occuperai d'immortaliser les meilleurs moments du mariage et de capter les plus beaux sourires. 
                
                Aurélie a récemment mis mon site web en production, il est vraiment très réussi, du beau travail !`
            },
            
            /*gift*/
            {
                x:4,
                y: -7,
                link: "https://www.leetchi.com/fr/c/wOVOg9Vl",
                dialog: `Au vu des circonstances actuelles, l'organisation d'une liste de mariage s'avère plus compliquée que prévue.
                C'est pourquoi, nous vous proposons une cagnotte en ligne. Cliquez sur le bouton "Site Web" à la fin de ce message pour y accéder.
                Une urne sera également mise à votre disposition le jour du mariage.`
            },
            
            /*mystery box*/
            {
                x:5,
                y: -7,
                dialog: `Une boîte ? 

                Hmm Mais pourquoi ?`
            },
            
            /*cook*/
            {
                x:7,
                y: -7,
                link: "http://lautrement-traiteur.fr/",
                dialog: `Bonjour, je suis un cuisinier de l'Autrement Traiteur. 

                Avec mon équipe, nous nous chargerons de vous satisfaire avec de délicieux amuses-bouches pendant le cocktail et de délicieux plats et desserts lors du repas fait avec des produits frais et locaux.`
            },
            
            /*DJ*/
            {
                x:8,
                y: -5,
                link: "https://www.facebook.com/CREATOROFEMOTION/",
                dialog: `Bonjour, moi c'est Clément, le DJ Son & Lumières du mariage d'Aurélie et Jérémy.

                Lors de leur mariage, j'assurerai l'ambiance musicale et lumineuse du lieu de réception.`
            },
            
            /*hairdresser*/
            {
                x:8,
                y: -3,
                link: "https://www.facebook.com/DiasLudovic/",
                dialog: `Coiffeur / barbier : Ludovic DIAS`
            },
            
            /*make-up*/
            {
                x:8,
                y: -2,
                link: "https://www.facebook.com/Elodiedavidinstitut/",
                dialog: `Maquilleuse : Elodie DAVID Institut`
            },
            
            /*envelope*/
            {
                x:8,
                y: -1,
                link: "https://www.copie-crea.fr/",
                dialog: `- ✉️ Enveloppe et cartons d'invitation imprimés par Copie Créa
                - 📋 Illustrations : de Jérémy VIGNELLES et Aurélie RENARD sur inspiration de RPG Maker XP
                - 🌐 Site web jeu vidéo réalisé par Aurélie et Jérémy.`
            },

            /*groom clothes*/
            {
                x:2,
                y: -3,
                link: "https://www.fatherandsons.fr/",
                dialog: `Mon costume a été acheté chez "Father & Sons".
                Vous êtes un homme et vous avez besoin d'un costume pour notre mariage ? 
                Tous les hommes du mariage peuvent bénéficier de -10% sur leur achat chez "Father & Sons" si ils disent qu'ils viennent pour le mariage de "Jérémy VIGNELLES".
                Cette offre est valable sur tous les magasins "Father & Sons" de France.`
            },
            
            /*groom*/
            {
                x:3,
                y: -2,
                dialog: `J'espère que vous appréciez la visite autant que nous nous sommes amusés à créer ce petit monde.
                Saurez-vous trouver toutes les références geek qui s'y cachent ?`
            },
            
            /*bride*/
            {
                x: 4,
                y: -2,
                dialog: `Un jour j'ai rencontré Jérémy, c'était mon prof de web.
                Puis il est devenu mon petit ami, mon fiancé et bientôt mon mari.
                C'est fou ce que ça passe vite, 6 ans dans une vie.`
            },
            
            /*bride clothes*/
            {
                x:5,
                y: -3,
                link: "https://www.facebook.com/opheliemariages/",
                dialog: `J'ai acheté ma robe de mariée à la boutique "Ophélie Mariages" à Orléans. 

                Merci à mes 2 témoins et à ma demoiselle d'honneur de m'avoir accompagnée lors des essayages.`
            },
        ];

        if(document.referrer)
        {
            if(document.referrer.endsWith("/Home/Roadmap2"))
            {
                this.playerPosition.pos.y = -6;
                this.playerPosition.direction = Direction.Up;
            }
            if(document.referrer.endsWith("/Home/ParkingOlivet"))
            {
                this.playerPosition.pos.y = -3;
                this.playerPosition.direction = Direction.Left;
            }
        }
    }

    /**
     * Initializes all assets for the game
     * This method can be overriden
     */
    protected async initAssets() {
        await super.initAssets();
        this.sprites = await loadImage("/img/infos-pratiques.png");
        this.patterns = {
            wallBottom: this.createPattern(this.sprites, this.spritesDescription.wallBottom),
        };
    }

    /**
     * Draws the current state of the world.
     */
    protected draw() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

        this.drawImage(this.sprites, this.spritesDescription.infosHouse, { x: -2, y: -10 });
        
        // Draw middle sprites, if they are under the characters
        for(let i = 0; i < this.middleSprites.length;i++)
        {
            let s = this.middleSprites[i];
            if(this.playerPosition.pos.y >= s.y)
            {
                this.drawImage(this.sprites, s.desc, {x: s.x, y: s.y - s.desc.height + 1});
            }
        }

        super.draw();
        
        // Draw middle sprites, if they are over the characters
        for(let i = 0; i < this.middleSprites.length;i++)
        {
            let s = this.middleSprites[i];
            if(this.playerPosition.pos.y < s.y)
            {
                this.drawImage(this.sprites, s.desc, {x: s.x, y: s.y - s.desc.height + 1});
            }
        }
        
        // In order to avoid weird things around the carpet, we decided that the wall must be drawn over the 2x of the carpet side.
        // This is why I have 2/32 here, for those 2px over a square of 32.
        this.drawPattern(this.patterns.wallBottom, { x: -2, y: 0, width: 2 + (2/32), height: 1});
        this.drawPattern(this.patterns.wallBottom, { x: 1 - (2/32), y: 0, width: 9 + (2/32), height: 1});

        if(this.exitHouseOverlayOpacity > 0)
        {
            this.context.fillStyle = "rgba(255, 255, 255, "+this.exitHouseOverlayOpacity+")";
            this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        }
    }

    protected computeAnimations() {
        super.computeAnimations();

        // Exiting the house animation.
        if(this.playerPosition.pos.y > 0  && this.exitHouseOverlayOpacity < 1)
        {
            this.exitHouseOverlayOpacity += 0.05;
            this.needRefresh = true;
            if(this.exitHouseOverlayOpacity >= 0.5 && !this.redirected)
            {
                window.location.pathname = "/";
                this.redirected = true;
            }
        }
    }

    /**
     * After an animation ends, this method is called to get the new list of allowed directions.
     * This effectively tells the collisions
     */
    protected computeEnabledControls()
    {
        if(this.currentDialog !== null)
        {
            return {
                left: false,
                right: false,
                up: false,
                down: false,
                a: this.isDialogReadyForNext(),
                b: true,
                start: false,
                zoomPlus: (this.scaleFactor < this.zoomBounds.max),
                zoomMinus: (this.scaleFactor > this.zoomBounds.min),
            };
        }

        const position = {x: Math.round(this.playerPosition.pos.x), y: Math.round(this.playerPosition.pos.y)};

        //At exit
        if(position.y == 1)
        {
            return {
                left: false,
                right: false,
                up: false,
                down: false,
                a: false,
                b: false,
                start: false,
                zoomPlus: false,
                zoomMinus: false,
            };    
        }

        return {
            left: this.playerPosition.direction != Direction.Left || (position.x > 0 && this.hasNothing({x:position.x - 1, y: position.y})),
            right: this.playerPosition.direction != Direction.Right || (position.x < 7 && this.hasNothing({x:position.x + 1, y: position.y})),
            up: this.playerPosition.direction != Direction.Up || (position.y > -6 && this.hasNothing({x:position.x, y: position.y - 1})),
            down: this.playerPosition.direction != Direction.Down || (position.y < 0 && this.hasNothing({x:position.x, y: position.y + 1})) || position.x == 0,
            a: this.getDialogInFront() !== undefined,
            b: true,
            start: true,
            zoomPlus: (this.scaleFactor < this.zoomBounds.max),
            zoomMinus: (this.scaleFactor > this.zoomBounds.min),
        };
    }

    protected hasNothing(at:SquarePosition)
    {
        return !this.middleSprites.some(s => s.x == at.x && s.y == at.y);
    }
}

var game = new InfosGame();
game.run();
