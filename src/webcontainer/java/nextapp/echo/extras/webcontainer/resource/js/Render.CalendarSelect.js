/**
 * Component rendering peer: CalendarSelect
 */
ExtrasRender.ComponentSync.CalendarSelect = Core.extend(EchoRender.ComponentSync, {

    $static: {
    
        DEFAULT_FOREGROUND: new EchoApp.Color("#000000"),
        DEFAULT_BACKGROUND: new EchoApp.Color("#ffffff"),
        DEFAULT_BORDER: new EchoApp.Border("2px groove #5f5faf"),
        DEFAULT_SELECTED_DATE_FOREGROUND: new EchoApp.Color("#000000"),
        DEFAULT_SELECTED_DATE_BACKGROUND: new EchoApp.Color("#ffffaf"),
        DEFAULT_ADJACENT_MONTH_DATE_FOREGROUND: new EchoApp.Color("#7f7f7f"),

        _DAYS_IN_MONTH: [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        
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
        EchoRender.registerPeer("ExtrasApp.CalendarSelect", this);
    },
    
    _element: null,
    _monthSelect: null,
    _yearField: null,
    _dayTdElements: null,
    
    _year: null,
    _month: null,
    _day: null,
    
    // FIXME temporary
    _icons: { },

    _rb: new Core.ResourceBundle({
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
    
    _calculateCalendarInformation: function() {
        var firstDate = new Date(this._year, this._month, 1);
        this._firstDayOfMonth = firstDate.getDay();
        
        this._daysInMonth = ExtrasRender.ComponentSync.CalendarSelect.getDaysInMonth(this._year, this._month);
        if (this._month == 0) {
            this._daysInPreviousMonth = ExtrasRender.ComponentSync.CalendarSelect.getDaysInMonth(this._year - 1, 11);
        } else {
            this._daysInPreviousMonth = ExtrasRender.ComponentSync.CalendarSelect.getDaysInMonth(this._year, this._month - 1);
        }
    },
    
    _processDateSelect: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            return;
        }
        if (e.target._cellIndex == null) {
            return;
        }
        var cellIndex = e.target._cellIndex;
        
        var selectedDay, selectedMonth, selectedYear;
        if (cellIndex < this._firstDayOfMonth) {
            if (this._month == 0) {
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
    },
    
    _processMonthSelect: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            this._monthSelect.selectedIndex = this._month;
            return;
        }
        
        this._month = this._monthSelect.selectedIndex;
        this._updateCalendar();
    },
    
    _processYearChange: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            this._yearField.value = this._year;
            return;
        }
        this._year = parseInt(this._yearField.value);
        this._updateCalendar();
    },
    
    _processYearDecrement: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            return;
        }
        --this._year;
        this._yearField.value = this._year;
        this._updateCalendar();
    },

    _processYearIncrement: function(e) {
        if (!this.client.verifyInput(this.component, EchoClient.FLAG_INPUT_PROPERTY)) {
            retrun;
        }
        ++this._year;
        this._yearField.value = this._year;
        this._updateCalendar();
    },

    renderAdd: function(update, parentElement) {
        var i, j, tdElement, trElement;
        var dayOfWeekNameAbbreviationLength = parseInt(this.component.getRenderProperty("dayOfWeekNameAbbreviationLength", 2));
        var firstDayOfWeek = this._rb.get("FirstDayOfWeek");
        if (!firstDayOfWeek) {
            firstDayOfWeek = 0;
        }
    
        this._element = document.createElement("div");
        this._element.style.whiteSpace = "nowrap";
        
        this._monthSelect = document.createElement("select");
        for (var i = 0; i < 12; ++i) {
            var optionElement = document.createElement("option");
            optionElement.appendChild(document.createTextNode(this._rb.get("Month." + i)));
            this._monthSelect.appendChild(optionElement);
        }
        this._element.appendChild(this._monthSelect);
        
        this._element.appendChild(document.createTextNode(" "));
        
        this._yearDecrementElement = document.createElement("span");
        this._yearDecrementElement.style.cursor = "pointer";
        if (this._icons.decrement) {
            var imgElement = document.createElement("img");
            imgElement.src = this._icons.decrement;
            this._yearDecrementElement.appendChild(imgElement);
        } else {
            this._yearDecrementElement.appendChild(document.createTextNode("<"));
        }
        this._element.appendChild(this._yearDecrementElement);
        
        this._yearField = document.createElement("input");
        this._yearField.type = "text";
        this._yearField.maxLength = 4;
        this._yearField.size = 5;
        this._element.appendChild(this._yearField);

        this._yearIncrementElement = document.createElement("span");
        this._yearIncrementElement.style.cursor = "pointer";
        if (this._icons.increment) {
            var imgElement = document.createElement("img");
            imgElement.src = this._icons.increment;
            this._yearIncrementElement.appendChild(imgElement);
        } else {
            this._yearIncrementElement.appendChild(document.createTextNode(">"));
        }
        this._element.appendChild(this._yearIncrementElement);
        
        this._tableElement = document.createElement("table");
        this._tableElement.style.borderCollapse = "collapse";
        this._tableElement.style.margin = "1px";
        EchoAppRender.Border.renderComponentProperty(this.component, "border", 
                ExtrasRender.ComponentSync.CalendarSelect.DEFAULT_BORDER, this._tableElement);
        EchoAppRender.Color.renderComponentProperty(this.component, "foreground",
                ExtrasRender.ComponentSync.CalendarSelect.DEFAULT_FOREGROUND, this._tableElement); 
        EchoAppRender.FillImage.renderComponentProperty(this.component, "backgroundImage", null, this._tableElement); 
        
        var tbodyElement = document.createElement("tbody");
        
        trElement = document.createElement("tr");
        for (j = 0; j < 7; ++j) {
            tdElement = document.createElement("td");
            var dayOfWeekName = this._rb.get("DayOfWeek." + ((firstDayOfWeek + j) % 7));
            if (dayOfWeekNameAbbreviationLength > 0) {
                dayOfWeekName = dayOfWeekName.substring(0, dayOfWeekNameAbbreviationLength);
            }
            tdElement.appendChild(document.createTextNode(dayOfWeekName));
            trElement.appendChild(tdElement);
        }
        tbodyElement.appendChild(trElement);
        
        this._dayTdElements = [];
        
        var prototypeTdElement = document.createElement("td");
        prototypeTdElement.style.cursor = "pointer";
        prototypeTdElement.style.textAlign = "right";
        prototypeTdElement.style.borderWidth = "0";
        prototypeTdElement.style.padding = "0px 5px";
        
        for (i = 0; i < 6; ++i) {
            this._dayTdElements[i] = [];
            trElement = document.createElement("tr");
            for (j = 0; j < 7; ++j) {
                this._dayTdElements[i][j] = prototypeTdElement.cloneNode(false);
                this._dayTdElements[i][j]._cellIndex = i * 7 + j;
                trElement.appendChild(this._dayTdElements[i][j]);
            }
            tbodyElement.appendChild(trElement);
        }
        
        this._tableElement.appendChild(tbodyElement);
        this._element.appendChild(this._tableElement);
        
        parentElement.appendChild(this._element);
        
        WebCore.EventProcessor.add(this._monthSelect, "change", new Core.MethodRef(this, this._processMonthSelect), false);
        WebCore.EventProcessor.add(this._yearField, "change", new Core.MethodRef(this, this._processYearChange), false);
        WebCore.EventProcessor.add(this._yearDecrementElement, "click", 
                new Core.MethodRef(this, this._processYearDecrement), false);
        WebCore.EventProcessor.add(this._yearIncrementElement, "click", 
                new Core.MethodRef(this, this._processYearIncrement), false);
        WebCore.EventProcessor.add(this._tableElement, "click", 
                new Core.MethodRef(this, this._processDateSelect), false);

        //FIXME
        this._setDate(1977, 1, 1);
    },
    
    renderDispose: function(update) {
        WebCore.EventProcessor.removeAll(this._monthSelect);
        WebCore.EventProcessor.removeAll(this._yearField);
        WebCore.EventProcessor.removeAll(this._yearDecrementElement);
        WebCore.EventProcessor.removeAll(this._yearIncrementElement);
        WebCore.EventProcessor.removeAll(this._tableElement);
    
        this._dayTdElements = null;
        this._element = null;
        this._monthSelect = null;
        this._yearField = null;
    },
    
    renderUpdate: function(update) {
        var element = this._element;
        var containerElement = element.parentNode;
        EchoRender.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false;
    },
    
    _setDate: function(year, month, day) {
        this._year = year;
        this._month = month;
        this._day = day;
        
        this._yearField.value = year;
        this._monthSelect.selectedIndex = month;
        
        this._updateCalendar();
    },
    
    _updateCalendar: function() {
        this._calculateCalendarInformation();
        var day = 1 - this._firstDayOfMonth;
        
        var adjacentMonthDateForeground = this.component.getRenderProperty("adjacentMonthDateForeground",
                ExtrasRender.ComponentSync.CalendarSelect.DEFAULT_ADJACENT_MONTH_DATE_FOREGROUND);
        var foreground = this.component.getRenderProperty("foreground", 
                ExtrasRender.ComponentSync.CalendarSelect.DEFAULT_FOREGROUND);
        var selectedForeground = this.component.getRenderProperty("selectedForeground", 
                ExtrasRender.ComponentSync.CalendarSelect.DEFAULT_SELECTED_DATE_FOREGROUND);
        var selectedBackground = this.component.getRenderProperty("selectedBackground", 
                ExtrasRender.ComponentSync.CalendarSelect.DEFAULT_SELECTED_DATE_BACKGROUND);
        
        for (var i = 0; i < 6; ++i) {
            for (var j = 0; j < 7; ++j) {
                var tdElement = this._dayTdElements[i][j];
                
                while (tdElement.hasChildNodes()) {
                    tdElement.removeChild(tdElement.firstChild);
                }
                
                var renderedText;
                var styleText;
                if (day < 1) {
                    renderedText = this._daysInPreviousMonth + day;
                    EchoAppRender.Color.renderClear(adjacentMonthDateForeground, tdElement, "color");
                    EchoAppRender.Color.renderClear(null, tdElement, "backgroundColor");
                } else if (day > this._daysInMonth) {
                    renderedText = day - this._daysInMonth;
                    EchoAppRender.Color.renderClear(adjacentMonthDateForeground, tdElement, "color");
                    EchoAppRender.Color.renderClear(null, tdElement, "backgroundColor");
                } else {
                    renderedText = day;
                    if (day == this._day) {
                        EchoAppRender.Color.renderClear(selectedForeground, tdElement, "color");
                        EchoAppRender.Color.renderClear(selectedBackground, tdElement, "backgroundColor");
                    } else {
                        EchoAppRender.Color.renderClear(foreground, tdElement, "color");
                        EchoAppRender.Color.renderClear(null, tdElement, "backgroundColor");
                    }
                }
                var textNode = document.createTextNode(renderedText);
                tdElement.appendChild(textNode);
                ++day;
            }
        }
    }
});
    
    