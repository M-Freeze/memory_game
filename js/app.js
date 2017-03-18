angular.module('app', [])
    .directive('changeColor', function () {
        return {
            link: function ($scope, element, attrs) {
                if (attrs.class.includes('glyphicon-question-sign')) {
                    element.bind('mouseenter', function () {
                        element.css('color', 'yellow');
                    });
                    element.bind('mouseleave', function () {
                        element.css('color', 'black');
                    });
                }
            }
        };
    })

    .directive('compile', ['$compile', function ($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            );
        };
    }])

    .controller('matchController', function ($scope, $sce) {
        let self = this;
        self.score = 0; // holds score displayed in score div
        self.message = ''; // holds message that is displayed in message div
        self.id1D = []; // holds 1d array of icon ID's
        self.id2D = []; // holds 2d array of icon ID's
        self.image1D = []; // holds 1d array of icon Image names
        self.image2D = []; // holds 2d array of icon Image names
        self.class1D = []; // holds 1d array of icon classes
        self.class2D = []; // holds 2d array of icon classes
        self.clicksImage = []; // holds array of clicked icon images
        self.clicksID = []; // holds array of clicked icon ids
        self.iconImages = ["music", "envelope", "home", "glass", "film", "camera", "calendar", "plane","globe", "tree-conifer", "piggy-bank", "scissors"];
        self.fieldSize = 4;
        self.numberOfClicks = 0;
        self.gameFieldHtml = "";

        self.convertTo2D = function (temp1D, temp2D) {
            let count = 0;
            temp2D.length = 0;
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
                    let tempClickString = "'match.clickLogic(match.id2D[" + i + "][" + j + "], match.image2D[" + i + "][" + j + "], match.class2D[" + i + "][" + j + "])'";
                    tempMessage += "<div id='" + self.id2D[i][j] + "' class='" + self.class2D[i][j] + " text-center' data='" + self.image2D[i][j] + "' ng-click=" + tempClickString + " change-color></div>";
                }
                tempMessage += "</div>";
            }
            tempMessage += "</div><div class='col-md-2'></div></div>";
            self.gameFieldHtml = tempMessage;
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
            let tempOrderedIcons = [];
            self.id1D.length = 0;
            self.class1D.length = 0;
            self.image1D.length = 0;

            let tempIconImages = self.iconImages.slice();
            let numberIconsNeeded = ((self.fieldSize * self.fieldSize) / 2);

            for (let i = 0; i < numberIconsNeeded; i++) {
                let randomIcon = Math.floor(Math.random() * tempIconImages.length);
                tempOrderedIcons.push(tempIconImages[randomIcon]);
                tempOrderedIcons.push(tempIconImages[randomIcon]);
                tempIconImages.splice(randomIcon, 1);
            }

            for (let i = 0; i < (self.fieldSize * self.fieldSize); i++) { // randomize the order of the iconImages
                if (tempOrderedIcons.length > 0) {
                    let rnd = Math.floor(Math.random() * (tempOrderedIcons.length - 1));
                    self.image1D.push(tempOrderedIcons[rnd]);
                    tempOrderedIcons.splice(rnd, 1);
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

        self.reset = function () {
            self.message = "Game Reset!";
            self.score = 0;
            self.generateIconImages();
        };

        self.clickLogic = function (clickedId, clickedData, clickedClass) {
            // If clicked on an already matched icon then return and do nothing
            if (clickedClass.includes('gameCellMatched')) return;

            let first, second;
            let tempClassInsert = " col-md-2 ";
            self.message = '';
            self.clicksID.push(clickedId);
            first = parseInt(clickedId.substr(0, 1));
            second = parseInt(clickedId.substr(2, 3));
            self.class2D[first][second] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-" + self.image2D[first][second];
            self.drawField();
            self.numberOfClicks++;

            if (self.numberOfClicks === 2) {
                self.clicksImage.push(clickedData);

                if (self.clicksImage[0] === self.clicksImage[1] && self.clicksID[0] !== self.clicksID[1]) {
                    // replace gameCell with gameCellMatched class in class2D for both matched icons
                    self.class2D[parseInt(self.clicksID[0][0])][parseInt(self.clicksID[0][2])] = "gameCellMatched center-block glyphicon "
                        + tempClassInsert + " glyphicon-" + self.image2D[parseInt(self.clicksID[0][0])][parseInt(self.clicksID[0][2])];
                    self.class2D[parseInt(self.clicksID[1][0])][parseInt(self.clicksID[1][2])] = "gameCellMatched center-block glyphicon "
                        + tempClassInsert + " glyphicon-" + self.image2D[parseInt(self.clicksID[1][0])][parseInt(self.clicksID[1][2])];
                    self.score += 2;
                    self.drawField();
                    if (self.score === (self.fieldSize * self.fieldSize)) {
                        self.message = 'You Won!';
                    }
                } else {
                    self.isMatch = false;
                }
            } else if (self.numberOfClicks === 3) {
                // If on the third click the first two don't match reset them to question signs
                if (!(self.clicksImage[0] === self.clicksImage[1] && self.clicksID[0] !== self.clicksID[1])) {
                    self.class2D[parseInt(self.clicksID[0][0])][parseInt(self.clicksID[0][2])] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-question-sign";
                    self.class2D[parseInt(self.clicksID[1][0])][parseInt(self.clicksID[1][2])] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-question-sign";
                }
                self.class2D[first][second] = "gameCell center-block glyphicon " + tempClassInsert + " glyphicon-" + self.image2D[first][second];
                self.clicksImage.length = 0;
                self.clicksID.length = 0;
                self.clicksID.push(clickedId);
                self.clicksImage.push(clickedData);
                self.drawField();
                self.numberOfClicks = 1;
            } else {
                self.clicksImage.push(clickedData);
            }
        }
    });

