angular.module('app', [])
    .controller('matchController', function ($scope) {
        let self = this;
        self.score = 0;
        self.message = '';
        self.id1D = [];
        self.id2D = [];
        self.image1D = [];
        self.image2D = [];
        self.class1D = [];
        self.class2D = [];
        self.clicks = [];
        self.clicksID = [];
        self.icons = [];
        self.iconImages = ["music", "envelope", "home", "glass", "film", "camera", "calendar", "plane",
            "globe", "tree-conifer", "piggy-bank", "scissors"]; // all possible iconImages
        self.fieldSize = 4;
        self.numberOfClicks = 0;
        self.isMatch = false;

        self.convertTo2D = function (temp1D, temp2D) {
            let count = 0;
            for (let i = 0; i < self.fieldSize; i++) {
                let tempArray = [];
                for (let j = 0; j < self.fieldSize; j++) {
                    tempArray.push(temp1D[count]);
                    count++;
                }
                temp2D.push(tempArray);
            }
        };

        self.drawField = function () {
            let tempMessage = "<div class='row'>";
            for (let i = 0; i < self.fieldSize; i++) {
                tempMessage += "<div class='row'><div class='col-md-2'></div>";
                for (let j = 0; j < self.fieldSize; j++) {
                    let tempClickString = "'match.clickLogic(self.id2D["+i+"]["+j+"], self.image2D["+i+"]["+j+"])'";
                    console.log(tempClickString);
                    tempMessage += "<div id='" + self.id2D[i][j] + "' class='" + self.class2D[i][j] + " text-center' data='" + self.image2D[i][j] + "' ng-click="+tempClickString+"></div>";
                }
                tempMessage += "</div>";
            }
            tempMessage += "</div><div class='col-md-2'></div></div>";
            return tempMessage;
        };

        self.generateField = function () {
            for (let i = 0; i < self.fieldSize; i++) {
                for (let j = 0; j < self.fieldSize; j++) {
                    self.class2D[i][j] += " col-md-2 glyphicon-question-sign ";
                }
            }
            self.drawField();
        };

        self.generateIconImages = function () {
            console.log('1');
            self.icons.length = 0;
            self.id1D.length = 0;
            self.class1D.length = 0;
            self.image1D.length = 0;

            let tempIconImages = self.iconImages.slice();
            let numberIconsNeeded = ((self.fieldSize * self.fieldSize) / 2);

            for (let i = 0; i < numberIconsNeeded; i++) {
                let randomIcon = Math.floor(Math.random() * tempIconImages.length);
                self.icons.push(tempIconImages[randomIcon]);
                self.icons.push(tempIconImages[randomIcon]);
                tempIconImages.splice(randomIcon, 1);
            }

            let tempArray = self.icons.slice();

            for (let i = 0; i < self.icons.length; i++) { // randomize the order of the iconImages
                if (tempArray.length > 0) {
                    let rnd = Math.floor(Math.random() * (tempArray.length - 1));
                    self.image1D.push(tempArray[rnd]);
                    tempArray.splice(rnd, 1);
                }
            }

            for (let i = 0; i < self.fieldSize; i++) {
                for (let j = 0; j < self.fieldSize; j++) {
                    self.id1D.push(i + "-" + j);
                    self.class1D.push("gameCell center-block glyphicon");
                }
            }

            self.convertTo2D(self.id1D, self.id2D);
            self.convertTo2D(self.image1D, self.image2D);
            self.convertTo2D(self.class1D, self.class2D);
            self.generateField();
        };

        self.generateIconImages();
        self.drawField();

        self.reset = function () {
            self.message = "Game Reset!";
            self.id2D.length = 0;
            self.class2D.length = 0;
            self.image2D.length = 0;
            self.score = 0;

            self.generateIconImages();
        };

        self.clickLogic = function (clickedId, clickedData) {
            let first, second;
            self.message.length = 0;
            self.clicksID.push(clickedId);

            first = parseInt(clickedId.substr(0, 1));
            second = parseInt(clickedId.substr(2, 3));
            let tempClassInsert = " col-md-2 ";
            self.class2D[first][second] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-" + self.image2D[first][second];
            self.drawField();

            self.numberOfClicks++;
            if (self.numberOfClicks === 2) {
                self.clicks.push(clickedData);
                if (self.clicks[0] === self.clicks[1] && self.clicksID[0] !== self.clicksID[1]) {
                    self.isMatch = true;
                    self.class2D[parseInt(self.clicksID[0][0])][parseInt(self.clicksID[0][2])] = "gameCellMatched center-block glyphicon "
                        + tempClassInsert + " glyphicon-" + self.image2D[parseInt(self.clicksID[0][0])][parseInt(self.clicksID[0][2])]; // replace gameCell with gameCellMatched class in class2D
                    self.class2D[parseInt(self.clicksID[1][0])][parseInt(self.clicksID[1][2])] = "gameCellMatched center-block glyphicon "
                        + tempClassInsert + " glyphicon-" + self.image2D[parseInt(self.clicksID[1][0])][parseInt(self.clicksID[1][2])]; // replace gameCell with gameCellMatched class in class2D
                    self.drawField();
                    self.score += 2;
                    if (self.score === (self.fieldSize * self.fieldSize)) {
                        self.message = 'You Won!';
                    }
                } else {
                    self.isMatch = false;
                }
            } else if (self.numberOfClicks === 3) {
                if (!self.isMatch) {
                    self.class2D[parseInt(self.clicksID[0][0])][parseInt(self.clicksID[0][2])] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-question-sign";
                    self.class2D[parseInt(self.clicksID[1][0])][parseInt(self.clicksID[1][2])] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-question-sign";
                }
                self.class2D[first][second] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-" + self.image2D[first][second];
                self.drawField();
                self.clicks.length = 0;
                self.clicksID.length = 0;
                self.clicksID.push(clickedId);
                self.clicks.push(clickedData);
                self.numberOfClicks = 1;
            } else {
                self.clicks.push(clickedData);
            }
        }
    });
