/**
 * Component rendering peer: CalendarSelect
 */
Extras.Sync.CalendarSelect = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        DEFAULT_FOREGROUND: "#000000",
        DEFAULT_BACKGROUND: "#ffffff",
        DEFAULT_BORDER: "2px groove #5f5faf",
        DEFAULT_SELECTED_DATE_FOREGROUND: "#000000",
        DEFAULT_SELECTED_DATE_BACKGROUND: "#ffffaf",
        DEFAULT_ADJACENT_MONTH_DATE_FOREGROUND: "#7f7f7f",

        _DAYS_IN_MONTH: [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        
        resource: new Core.ResourceBundle({
            "DayOfWeek.0":     "Sunday",
            "DayOfWeek.1":     "Monday",
            "DayOfWeek.2":     "Tuesday",
            "DayOfWeek.3":     "Wednesday",
            "DayOfWeek.4":     "Thursday",
            "DayOfWeek.5":     "Friday",
            "DayOfWeek.6":     "Saturday",
            "Month.0":         "January",
            "Month.1":         "February",
            "Month.2":         "March",
            "Month.3":         "April",
            "Month.4":         "May",
            "Month.5":         "June",
            "Month.6":         "July",
            "Month.7":         "August",
            "Month.8":         "September",
            "Month.9":         "October",
            "Month.10":        "November",
            "Month.11":        "December",
            "FirstDayOfWeek":  "0"
        }),
        
        /**
         * Determines the number of days in a specific month.
         *
         * @param year the year of the month
         * @param month the month
         * @return the number of days in the month
         */
        getDaysInMonth: function(year, month) {
            if (month == 1) {
                if (year % 400 === 0) {
                    return 29;
                } else if (year % 100 === 0) {
                    return 28;
                } else if (year % 4 === 0) {
                    return 29;
                } else {
                    return 28;
                }
            } else {
                return this._DAYS_IN_MONTH[month];
            }
        }
    },

    $load: function() {
        Echo.Render.registerPeer("Extras.CalendarSelect", this);
    },
    
    _div: null,
    _monthSelect: null,
    _yearField: null,
    _dayTds: null,
    
    _year: null,
    _month: null,
    _day: null,
    
    _msg: null,
    
    _icons: { },
    
    _calculateCalendarInformation: function() {
        var firstDate = new Date(this._year, this._month, 1);
        this._firstDayOfMonth = firstDate.getDay();
        
        this._daysInMonth = Extras.Sync.CalendarSelect.getDaysInMonth(this._year, this._month);
        if (this._month === 0) {
            this._daysInPreviousMonth = Extras.Sync.CalendarSelect.getDaysInMonth(this._year - 1, 11);
        } else {
            this._daysInPreviousMonth = Extras.Sync.CalendarSelect.getDaysInMonth(this._year, this._month - 1);
        }
    },
    
    _processDateSelect: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        if (e.target._cellIndex == null) {
            return;
        }
        var cellIndex = e.target._cellIndex;
        
        var selectedDay, selectedMonth, selectedYear;
        if (cellIndex < this._firstDayOfMonth) {
            if (this._month === 0) {
                selectedMonth = 11;
                selectedYear = this._year - 1;
            } else {
                selectedMonth = this._month - 1;
                selectedYear = this._year;
            }
            selectedDay = this._daysInPreviousMonth - this._firstDayOfMonth + cellIndex + 1;
        } else if (cellIndex >= (this._firstDayOfMonth + this._daysInMonth)) {
            if (this._month == 11) {
                selectedMonth = 0;
                selectedYear = this._year + 1;
            } else {
                selectedMonth = this._month + 1;
                selectedYear = this._year;
            }
            selectedDay = cellIndex - this._firstDayOfMonth - this._daysInMonth + 1;
        } else {
            selectedMonth = this._month;
            selectedYear = this._year;
            selectedDay = cellIndex - this._firstDayOfMonth + 1;
        }
        
        this._setDate(selectedYear, selectedMonth, selectedDay);
        this._updateCalendarDisplay();
        this._storeValue();
    },
    
    _processMonthSelect: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            this._monthSelect.selectedIndex = this._month;
            return;
        }
        
        this._month = this._monthSelect.selectedIndex;
        this._updateCalendarDisplay();
        this._storeValue();
    },
    
    _processYearChange: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            this._yearField.value = this._year;
            return;
        }
        this._year = parseInt(this._yearField.value, 10);
        this._updateCalendarDisplay();
        this._storeValue();
    },
    
    _processYearDecrement: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        --this._year;
        this._yearField.value = this._year;
        this._updateCalendarDisplay();
        this._storeValue();
    },

    _processYearIncrement: function(e) {
        if (!this.client.verifyInput(this.component, Echo.Client.FLAG_INPUT_PROPERTY)) {
            return;
        }
        ++this._year;
        this._yearField.value = this._year;
        this._updateCalendarDisplay();
        this._storeValue();
    },

    renderAdd: function(update, parentElement) {
        // Load localization data.
        this._msg = Extras.Sync.CalendarSelect.resource.get(this.component.getRenderLocale());

        var enabled = this.component.isRenderEnabled();
        
        var i, j, td, tr, img;
        var dayOfWeekNameAbbreviationLength = parseInt(this.component.render("dayOfWeekNameAbbreviationLength", 2), 10);
        var firstDayOfWeek = this._msg["FirstDayOfWeek"];
        if (!firstDayOfWeek) {
            firstDayOfWeek = 0;
        }
    
        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.whiteSpace = "nowrap";
        
        this._monthSelect = document.createElement("select");
        for (i = 0; i < 12; ++i) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode(this._msg["Month." + i]));
            this._monthSelect.appendChild(option);
        }
        if (!enabled) {
            this._monthSelect.disabled = true;
        }
        this._div.appendChild(this._monthSelect);
        
        this._div.appendChild(document.createTextNode(" "));
        
        this._yearDecSpan = document.createElement("span");
        this._yearDecSpan.style.cursor = "pointer";
        img = document.createElement("img");
        img.src = this._icons.decrement ? this._icons.decrement :
                this.client.getResourceUrl("Extras", "image/calendar/Decrement.gif");
        img.alt = "-";
        this._yearDecSpan.appendChild(img);
        this._div.appendChild(this._yearDecSpan);
        
        this._yearField = document.createElement("input");
        this._yearField.type = "text";
        this._yearField.style.textAlign = "center";
        this._yearField.maxLength = 4;
        this._yearField.size = 5;
        if (!enabled) {
            this._yearField.readOnly = true;
        }
        this._div.appendChild(this._yearField);

        this._yearIncSpan = document.createElement("span");
        this._yearIncSpan.style.cursor = "pointer";
        img = document.createElement("img");
        img.src = this._icons.increment ? this._icons.increment :
                this.client.getResourceUrl("Extras", "image/calendar/Increment.gif");
        img.alt = "+";
        this._yearIncSpan.appendChild(img);
        this._div.appendChild(this._yearIncSpan);
        
        this._table = document.createElement("table");
        this._table.style.borderCollapse = "collapse";
        this._table.style.margin = "1px";
        Echo.Sync.Border.render(this.component.render("border", 
                Extras.Sync.CalendarSelect.DEFAULT_BORDER), this._table);
        Echo.Sync.Color.render(this.component.render("foreground",
                Extras.Sync.CalendarSelect.DEFAULT_FOREGROUND), this._table); 
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._table); 
        
        var tbody = document.createElement("tbody");
        
        tr = document.createElement("tr");
        for (j = 0; j < 7; ++j) {
            td = document.createElement("td");
            var dayOfWeekName = this._msg["DayOfWeek." + ((firstDayOfWeek + j) % 7)];
            if (dayOfWeekNameAbbreviationLength > 0) {
                dayOfWeekName = dayOfWeekName.substring(0, dayOfWeekNameAbbreviationLength);
            }
            td.appendChild(document.createTextNode(dayOfWeekName));
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        
        this._dayTds = [];
        
        var prototypeTd = document.createElement("td");
        prototypeTd.style.cursor = "pointer";
        prototypeTd.style.textAlign = "right";
        prototypeTd.style.borderWidth = "0";
        prototypeTd.style.padding = "0px 5px";
        
        for (i = 0; i < 6; ++i) {
            this._dayTds[i] = [];
            tr = document.createElement("tr");
            for (j = 0; j < 7; ++j) {
                this._dayTds[i][j] = prototypeTd.cloneNode(false);
                this._dayTds[i][j]._cellIndex = i * 7 + j;
                tr.appendChild(this._dayTds[i][j]);
            }
            tbody.appendChild(tr);
        }
        
        this._table.appendChild(tbody);
        this._div.appendChild(this._table);
        
        parentElement.appendChild(this._div);
        

        Core.Web.Event.add(this._monthSelect, "change", Core.method(this, this._processMonthSelect), false);
        Core.Web.Event.add(this._yearField, "change", Core.method(this, this._processYearChange), false);
        Core.Web.Event.add(this._yearDecSpan, "click", Core.method(this, this._processYearDecrement), false);
        Core.Web.Event.add(this._yearIncSpan, "click", Core.method(this, this._processYearIncrement), false);
        Core.Web.Event.add(this._table, "click", Core.method(this, this._processDateSelect), false);

        var date = this.component.get("date");
        if (!date) {
            date = new Date();
        }
        this._setDate(date.getFullYear(), date.getMonth(), date.getDate());
        
        this._updateCalendarDisplay();
    },
    
    renderDispose: function(update) {
        Core.Web.Event.removeAll(this._monthSelect);
        Core.Web.Event.removeAll(this._yearField);
        Core.Web.Event.removeAll(this._yearDecSpan);
        Core.Web.Event.removeAll(this._yearIncSpan);
        Core.Web.Event.removeAll(this._table);
    
        this._dayTds = null;
        this._div = null;
        this._monthSelect = null;
        this._yearField = null;
    },
    
    renderUpdate: function(update) {
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false;
    },
    
    _setDate: function(year, month, day) {
        this._year = year;
        this._month = month;
        this._day = day;
    },
    
    _storeValue: function() {
        this.component.set("date", new Date(this._year, this._month, this._day));
    },
    
    _updateCalendarDisplay: function() {
        this._yearField.value = this._year;
        this._monthSelect.selectedIndex = this._month;

        this._calculateCalendarInformation();
        var day = 1 - this._firstDayOfMonth;
        
        var adjacentMonthDateForeground = this.component.render("adjacentMonthDateForeground",
                Extras.Sync.CalendarSelect.DEFAULT_ADJACENT_MONTH_DATE_FOREGROUND);
        var foreground = this.component.render("foreground", 
                Extras.Sync.CalendarSelect.DEFAULT_FOREGROUND);
        var selectedForeground = this.component.render("selectedForeground", 
                Extras.Sync.CalendarSelect.DEFAULT_SELECTED_DATE_FOREGROUND);
        var selectedBackground = this.component.render("selectedBackground", 
                Extras.Sync.CalendarSelect.DEFAULT_SELECTED_DATE_BACKGROUND);
        
        for (var i = 0; i < 6; ++i) {
            for (var j = 0; j < 7; ++j) {
                var td = this._dayTds[i][j];
                
                while (td.hasChildNodes()) {
                    td.removeChild(td.firstChild);
                }
                
                var renderedText;
                var styleText;
                if (day < 1) {
                    renderedText = this._daysInPreviousMonth + day;
                    Echo.Sync.Color.renderClear(adjacentMonthDateForeground, td, "color");
                    Echo.Sync.Color.renderClear(null, td, "backgroundColor");
                } else if (day > this._daysInMonth) {
                    renderedText = day - this._daysInMonth;
                    Echo.Sync.Color.renderClear(adjacentMonthDateForeground, td, "color");
                    Echo.Sync.Color.renderClear(null, td, "backgroundColor");
                } else {
                    renderedText = day;
                    if (day == this._day) {
                        Echo.Sync.Color.renderClear(selectedForeground, td, "color");
                        Echo.Sync.Color.renderClear(selectedBackground, td, "backgroundColor");
                    } else {
                        Echo.Sync.Color.renderClear(foreground, td, "color");
                        Echo.Sync.Color.renderClear(null, td, "backgroundColor");
                    }
                }
                var textNode = document.createTextNode(renderedText);
                td.appendChild(textNode);
                ++day;
            }
        }
    }
});    