/*global ko document $ Sammy location */

$(document).ready(function() {
    function AppViewModel() {
        this.firstName = ko.observable("Zak");
        this.lastName = ko.observable("Elep");
        this.fullName = ko.computed(function () {
            return this.firstName() + " " + this.lastName();
        }, this);

        this.capitalizeLastName = function() {
            var currentVal = this.lastName();
            this.lastName(currentVal.toUpperCase());
        };
    }

    function SeatReservation(name, initialMeal) {
        var self = this;
        self.name = name;
        self.meal = ko.observable(initialMeal);

        self.formattedPrice = ko.computed(function() {
            var price = self.meal().price;
            return price ? "$" + price.toFixed(2) : "None";
        });
    }

    function ReservationsViewModel() {
        var self = this;

        self.availableMeals = [
            { mealName: "Standard (sandwich)", price: 0 },
            { mealName: "Premium (lobster)", price: 34.95 },
            { mealName: "Ultimate (whole zebra)", price: 290 },
        ];

        self.seats = ko.observableArray([
            new SeatReservation("Zak", self.availableMeals[0]),
            new SeatReservation("Tina", self.availableMeals[2]),
        ]);

        self.addSeat = function() {
            self.seats.push(new SeatReservation("", self.availableMeals[0]));
        };

        self.removeSeat = function(seat) { self.seats.remove(seat); };

        self.totalSurcharge = ko.computed(function() {
            var total = 0;
            for (var i = 0; i < self.seats().length; i++)
                total += self.seats()[i].meal().price;
            return total;
        });
    }

    function WebmailViewModel() {
        var self = this;

        self.folders = [ 'Inbox', 'Archive', 'Sent', 'Spam' ];
        self.chosenFolderId = ko.observable();
        self.chosenFolderData = ko.observable();
        self.chosenMailData = ko.observable();

        self.goToFolder = function(folder) { location.hash = folder; };

        self.goToMail = function(mail) { location.hash = mail.folder + '/' + mail.id; };

        Sammy(function() {
            this.get('#:folder', function() {
                self.chosenFolderId(this.params.folder);
                self.chosenMailData(null);
                $.get('/mail', { folder: this.params.folder }, self.chosenFolderData);
            });

            this.get('#:folder/:mailId', function() {
                self.chosenFolderId(this.params.folder);
                self.chosenFolderData(null);
                $.get('/mail', { mailId: this.params.mailId }, self.chosenMailData);
            });

            this.get('', function() { this.app.runRoute('get', '#Inbox'); });
        }).run();
    }

    function Answer(text) { this.answerText = text; this.points = ko.observable(1); }

    function SurveyViewModel(question, pointsBudget, answers) {
        this.question = question;
        this.pointsBudget = pointsBudget;
        this.answers = $.map(answers, function(text) { return new Answer(text); });

        this.save = function() { alert('TODO'); };

        this.pointsUsed = ko.computed(function() {
            var total = 0;
            for (var i = 0; i < this.answers.length; i++)
                total += this.answers[i].points();
            return total;
        }, this);
    }

    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            var shouldDisplay = valueAccessor();
            $(element).toggle(shouldDisplay);
        },
        update: function(element, valueAccessor) {
            var shouldDisplay = valueAccessor();
            if (shouldDisplay) {
                $(element).fadeIn();
            }
            else {
                $(element).fadeOut();
            }
        }
    };

    ko.bindingHandlers.jqButton = {
        init: function(element) {
            $(element).button();
        },
        update: function(element, valueAccessor) {
            var currentValue = valueAccessor();
            $(element).button("option", "disabled", currentValue.enable === false);
        }
    };

    ko.bindingHandlers.starRating = {
        init: function(element, valueAccessor) {
            $(element).addClass('starRating');
            for (var i = 0; i < 5; i++)
                $('<span>').appendTo(element);

            $('span', element).each(function(index) {
                $(this).hover(
                    function() { $(this).prevAll().add(this).addClass('hoverChosen'); },
                    function() { $(this).prevAll().add(this).removeClass('hoverChosen'); }
                ).click(function() {
                    var observable = valueAccessor();
                    observable(index+1);
                });
            });
        },
        update: function(element, valueAccessor) {
            var observable = valueAccessor();
            $('span', element).each(function(index) {
                $(this).toggleClass('chosen', index < observable());
            });
        }
    };

    ko.applyBindings(new AppViewModel(), document.getElementById('basics'));
    ko.applyBindings(new ReservationsViewModel(), document.getElementById('seats'));
    ko.applyBindings(new WebmailViewModel(), document.getElementById('spa'));
    ko.applyBindings(new SurveyViewModel(
        "Which factors affect your technology choices?", 10, [
            "Functionaliy, compatibility, pricing - all that boring stuff",
            "How often is it mentioned in Hacker News",
            "Number of gradients/dropshadows on project homepage",
            "Totally believable testimonials on project homepage",
        ]), document.getElementById('custom-bindings'));

    $.material.init();
});
