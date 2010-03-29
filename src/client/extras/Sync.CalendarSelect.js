/**
 * Component rendering peer: CalendarSelect.
 * This class should not be extended by developers, the implementation is subject to change.
 */
Extras.Sync.CalendarSelect = Core.extend(Echo.Render.ComponentSync, {

    $static: {
    
        /**
         * Default rendering values used when component does not specify a property value.
         */
        DEFAULTS: {
            border: "1px outset #cfcfcf",
            background: "#cfcfcf",
            foreground: "#000000",
            font: {
                size: "10pt"
            },
            dateForeground: "#000000",
            dateBackground: "#dfdfdf",
            dateBorder: {
                top: "1px solid #efefef",
                left: "1px solid #efefef",
                right: "1px solid #bfbfbf",
                bottom: "1px solid #bfbfbf"
            },
            selectedDateForeground: "#ffffff",
            selectedDateBackground: "#2f2f6f",
            adjacentMonthDateForeground: "#8f8f8f"
        },
    
        /**
         * Minimum year to display (1582, beginning of Gregorian calendar).
         * @type Number
         */
        MINIMUM_YEAR: 1582,

        /**
         * Maximum year to display (9999).
         * @type Number
         */
        MAXIMUM_YEAR: 9999,

        /**
         * Array-map mapping month numbers (indices) to numbers of days in the month.
         * February is not specified due to it requiring calculation based on year.
         * @type Array
         */
        _DAYS_IN_MONTH: [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        
        /**
         * Localization resource bundle.
         */
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
            "FirstDayOfWeek":  0
        }),
        
        /**
         * Animation used for sliding new months/years into place.  The foreground color of the old content is also adjusted
         * gradually during the transition.
         */
        Animation: Core.extend(Extras.Sync.Animation, {
        
            /**
             * The container element.
             * @type Element
             */
            _container: null,
            
            /**
             * Measured bounds of <code>_container</code>.
             * @type Core.Web.Measure.Bounds
             */
            _containerBounds: null,
            
            /**
             * The old content DIV.
             * @type Element
             */
            _oldContent: null,

            /**
             * The new content DIV.
             * @type Element
             */
            _newContent: null,
            
            /**
             * Boolean flag indicating a vertical (true) or horizontal (false) direction of animation.
             * @type Boolean
             */
            _vertical: null,
            
            /**
             * Boolean flag indicating a downward/rightward (true) or upward/leftward (false) direction of animation.
             * @type Boolean
             */
            _forward: null,
            
            /**
             * Distance the animated effect will move the next content, in pixels.  May not be same as measured dimension
             * in case of overlap.
             * @type Number
             */
            _travel: null,
            
            /**
             * Number of pixels to overlap new content over old content (used when animating months vertically such that shared 
             * weeks are retained during animation).
             * @type Number
             */
            _overlap: null,
            
            /**
             * Old foreground color for old content.
             * @type #Color
             */
            _oldColor: null,
            
            /**
             * New foreground color for old content.
             * @type #Color
             */
            _newColor: null,
            
            /**
             * CSS positioning property being adjusted to perform animation (top/bottom/left/right). 
             * @type String
             */
            _adjust: null,
        
            /** @see Extras.Sync.Animation#runtime */
            runTime: 500,

            /**
             * Constructor.
             * 
             * @param {Element} container the container element
             * @param {Element} oldContent the old content DIV
             * @param {Element} newContent the new content DIV
             * @param {Boolean} vertical boolean flag indicating a vertical (true) or horizontal (false) direction of animation
             * @param {Boolean} forward boolean flag indicating a downward/rightward (true) or upward/leftward (false) direction
             *                  of animation
             * @param {Number} overlap number of pixels to overlap new content over old content (used when animating months
             *                 vertically such that shared weeks are retained during animation)
             * @param {#Color} oldColor old foreground color for old content
             * @param {#Color} newColor new foreground color for old content
             */
            $construct: function(container, oldContent, newContent, vertical, forward, overlap, oldColor, newColor) {
                this._container = container;
                this._oldContent = oldContent;
                this._newContent = newContent;
                this._vertical = vertical;
                this._forward = forward;
                this._overlap = overlap || 0;
                this._oldColor = oldColor;
                this._newColor = newColor;
            },
        
            /** @see Extras.Sync.Animation#init */
            init: function() {
                this._containerBounds = new Core.Web.Measure.Bounds(this._container);
                this._travel = (this._vertical ? this._containerBounds.height : this._containerBounds.width) - this._overlap;
                this._adjust = this._vertical ? (this._forward ? "top" : "bottom") : (this._forward ? "left" : "right"); 
                this._newContent.style[this._adjust] = this._travel + "px";
                this._container.appendChild(this._newContent);
            },

            /** @see Extras.Sync.Animation#step */
            step: function(progress) {
                var position = Math.round(this._travel * (1 - progress));
                this._oldContent.style.color = Echo.Sync.Color.blend(this._oldColor, this._newColor, 2 * progress);
                this._oldContent.style[this._adjust] = (position - this._travel) + "px";
                this._newContent.style[this._adjust] = position + "px";
            },

            /** @see Extras.Sync.Animation#complete */
            complete: function(abort) {
                this._newContent.style.left = this._newContent.style.top = 
                        this._newContent.style.right = this._newContent.style.bottom = "";
                if (this._oldContent.parentNode) {
                    this._oldContent.parentNode.removeChild(this._oldContent);
                }
            }
        }),
        
        /**
         * Data object describing a month of a specific year in a specific locale (first day of week setting).
         * Determines additional information about the month used for rendering.
         */
        MonthData: Core.extend({
            
            /**
             * First day of week of the month, Sunday = 0.
             * @type Number
             */
            firstDayOfMonth: null,
            
            /**
             * Number of days in the month.
             * @type Number
             */
            daysInMonth: null,
            
            /**
             * Number of days in the previous month.
             * @type Number
             */
            daysInPreviousMonth: null,
            
            /** 
             * The year.
             * @type Number
             */
            year: null,
            
            /**
             * The month.
             * @type Number
             */
            month: null,
            
            /**
             * Number of full or partial weeks in the month.  Varies by firstDayOfWeek value.  
             * @type Number
             */
            weekCount: null,
            
            /**
             * Cell position of day 1 of the month (0 = leftmost cell, 6 = rightmost cell).
             * @type Number
             */
            firstCellPosition: null,
            
            /**
             * Constructor.
             * 
             * @param {Number} year the year
             * @param {Number} month the month
             * @param {Number} first day of week to use when rendering the month (0 = Sunday)
             */
            $construct: function(year, month, firstDayOfWeek) {
                this.year = year;
                this.month = month;
                var firstDate = new Date(year, month, 1);
                this.firstDayOfMonth = firstDate.getDay();

                this.daysInMonth = Extras.Sync.CalendarSelect.getDaysInMonth(year, month);
                this.daysInPreviousMonth = month === 0 ? Extras.Sync.CalendarSelect.getDaysInMonth(year - 1, 11) :
                        this._daysInPreviousMonth = Extras.Sync.CalendarSelect.getDaysInMonth(year, month - 1);
                
                this.firstCellPosition = (7 + this.firstDayOfMonth - firstDayOfWeek) % 7;
                this.nextMonthWeek = Math.floor((this.firstCellPosition + this.daysInMonth) / 7); 
                this.weekCount = Math.ceil((this.firstCellPosition + this.daysInMonth) / 7);
            },
            
            /**
             * Determines the date of the cell at the specified index.
             * 
             * @param {Number} cellIndex the cell index, 0 = top left cell
             * @return an object describing the date at the specified cell, containing numeric month, day, and year properties
             * @type Object
             */
            getCellDate: function(cellIndex) {
                var date;
                if (cellIndex < this.firstCellPosition) {
                    date = this.month === 0 ? { month: 11, year: this.year - 1 } :
                            { month: this.month - 1, year: this.year };
                    date.day = this.daysInPreviousMonth - this.firstCellPosition + cellIndex + 1;
                } else if (cellIndex >= (this.firstCellPosition + this.daysInMonth)) {
                    date = this.month === 11 ? { month: 0, year: this.year + 1 } :
                            { month: this.month + 1, year: this.year };
                    date.day = cellIndex - this.firstCellPosition - this.daysInMonth + 1;
                } else {
                    date = { month: this.month, year: this.year, day: cellIndex - this.firstCellPosition + 1 };
                }
                return date;
            },
            
            /**
             * Determines the cell index of the specified day in the month.
             * 
             * @param {Number} day the day of the month
             * @return the cell index
             * @type Number 
             */
            getCellIndex: function(day) {
                return day + this.firstCellPosition - 1;
            },
            
            /**
             * Determines if the specified cell index lies in the current month or an adjacent month.
             * 
             * @return true if the cell index lies in an adjacent month, false if not
             * @type Boolean
             */
            isCellAdjacent: function(cellIndex) {
                return cellIndex < this.firstCellPosition || cellIndex >= (this.firstDayOfMonth + this.daysInMonth);
            }
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
    
    /**
     * Main outer DIV element.
     * @type Element
     */
    _div: null,
    
    /**
     * Container element for month/year fields.
     */
    _monthYearInput: null,
    
    /**
     * Month SELECT field.
     * @type Element
     */
    _monthSelect: null,
    
    /**
     * Year INPUT field.
     * @type element
     */
    _yearField: null,
    
    /**
     * Date rollover background color.
     * @type #Color
     */
    _dateRolloverBackground: null,
    
    /**
     * Date rollover background image.
     * @type #FillImage
     */
    _dateRolloverBackgroundImage: null,

    /**
     * Date rollover border.
     * @type #Border
     */
    _dateRolloverBorder: null,

    /**
     * Date rollover foreground color.
     * @type #Color
     */
    _dateRolloverForeground: null,
    
    /**
     * Date selection background color.
     * @type #Color
     */
    _dateSelectedBackground: null,

    /**
     * Date selection background image.
     * @type #FillImage
     */
    _dateSelectedBackgroundImage: null,

    /**
     * Date selection border.
     * @type #Border
     */
    _dateSelectedBorder: null,

    /**
     * Date selection foreground color.
     * @type #Color
     */
    _dateSelectedForeground: null,
    
    /**
     * Index of currently rolled over cell. 
     * @type Number
     */
    _rolloverCellIndex: null,
    
    /**
     * Currently displayed month.
     * @type Number
     */
    _displayedMonth: null,

    /**
     * Currently displayed year.
     * @type Number
     */
    _displayedYear: null,

    /**
     * First day of week for displayed localization (0 = Sunday).
     * @type Number
     */
    _firstDayOfWeek: null,
    
    /**
     * Currently selected date.  An object with month, day, and year numeric properties.
     * @type Object
     */
    _date: null,
    
    /**
     * Localization data map.
     * @type Object
     */
    _msg: null,
    
    /**
     * Custom icons map.
     * @type object
     */
    _icons: null,
    
    /**
     * Performs an animated update of the calendar.
     *
     * @param {Boolean} vertical transition new content in vertically (true) or horizontally (false)
     * @param {Boolean} forward transition new content in rightward/downward (true) or upward/leftward (false)
     * @param {Number} rowOverlap number of rows to overlap (applicable only in vertical transition)
     */
    _animateUpdate: function(vertical, forward, rowOverlap) {
        if (this._animation) {
            this._animation.abort();
        }
        
        var newDayContainerDiv = this._createDayContainer();
        var overlap = rowOverlap ? (rowOverlap * this._cellHeight + (rowOverlap - 1) * this._vCellSpacing) : 0;
        this._animation = new Extras.Sync.CalendarSelect.Animation(this._scrollContainer, this._dayContainerDiv, newDayContainerDiv, 
                vertical, forward, overlap, this._dateForeground, this._dateAdjacentForeground);
        this._animation.start(Core.method(this, function(abort) {
            this._dayContainerDiv = newDayContainerDiv;
            this._animation = null;
        }));
    },
    
    /**
     * Creates a day-container DIV element, which will hold the days of the calendar.  These elements are added to and removed
     * from the calendar using animation (if desired).
     * 
     * @return the day container element
     * @type Element
     */
    _createDayContainer: function() {
        var dayContainerDiv = document.createElement("div");
        dayContainerDiv.style.cssText = "position:absolute;";
        dayContainerDiv.style.width = this._rowWidth + "px";
        dayContainerDiv.style.height = (this._ySize * this._cellHeight + (this._ySize - 1) * this._vCellSpacing) + "px";
        for (var y = 0; y < this._ySize; ++y) {
            var rowDiv = this._createWeek(y);
            rowDiv.style.top = (y * (this._cellHeight + this._vCellSpacing)) + "px";
            dayContainerDiv.appendChild(rowDiv);
        }
        return dayContainerDiv;
    },
    
    /**
     * Creates the month and year input controls positioned above the calendar.
     * 
     * @return an element containing the month/year controls.
     * @type Element
     */
    _createMonthYearInput: function() {
        var i, option, img,
            enabled = this.component.isRenderEnabled(),
            span = document.createElement("span");
        
        this._monthSelect = document.createElement("select");
        for (i = 0; i < 12; ++i) {
            option = document.createElement("option");
            option.appendChild(document.createTextNode(this._msg["Month." + i]));
            this._monthSelect.appendChild(option);
        }
        if (!enabled) {
            this._monthSelect.disabled = true;
        }
        span.appendChild(this._monthSelect);

        span.appendChild(document.createTextNode(" "));
        
        this._yearDecSpan = document.createElement("span");
        this._yearDecSpan.style.cursor = "pointer";
        img = document.createElement("img");
        img.src = this._icons.decrement ? this._icons.decrement :
                this.client.getResourceUrl("Extras", "image/calendar/Decrement.gif");
        img.alt = "-";
        this._yearDecSpan.appendChild(img);
        span.appendChild(this._yearDecSpan);
        
        this._yearField = document.createElement("input");
        this._yearField.type = "text";
        this._yearField.style.textAlign = "center";
        this._yearField.maxLength = 4;
        this._yearField.size = 5;
        if (!enabled) {
            this._yearField.readOnly = true;
        }
        span.appendChild(this._yearField);

        this._yearIncSpan = document.createElement("span");
        this._yearIncSpan.style.cursor = "pointer";
        img = document.createElement("img");
        img.src = this._icons.increment ? this._icons.increment :
                this.client.getResourceUrl("Extras", "image/calendar/Increment.gif");
        img.alt = "+";
        this._yearIncSpan.appendChild(img);
        span.appendChild(this._yearIncSpan);
        
        return span;
    },

    /**
     * Creates a DIV containing a single week of days.
     *
     * @return the created DIV
     * @type Element
     */
    _createWeek: function(line) {
        var day = 1 - this._monthData.firstCellPosition + (7 * line);
        var rowDiv = document.createElement("div");
        rowDiv.style.cssText = "position:absolute;overflow:hidden;cursor:pointer;";
        rowDiv.style.width = this._rowWidth + "px";
        rowDiv.style.height = this._cellHeight + "px";
        for (var x = 0; x < this._xSize; ++x, ++day) {
            var cellDiv = document.createElement("div");
            cellDiv._cellIndex = 7 * line + x;
            cellDiv.style.cssText = "position:absolute;text-align:right;";
            cellDiv.style.left = (x * (this._cellWidth + this._hCellSpacing)) + "px";
            cellDiv.style.width = this._renderedCellWidth + "px";
            cellDiv.style.height = this._renderedCellHeight + "px";
            Echo.Sync.Border.render(this._dateBorder, cellDiv);
            cellDiv.style.padding = "2px 4px";
            cellDiv.style.overflow = "hidden";
            
            var displayDay;
            if (day < 1) {
                cellDiv.style.color = this._dateAdjacentForeground;
                displayDay = this._monthData.daysInPreviousMonth + day;
            } else if (day > this._monthData.daysInMonth) {
                cellDiv.style.color = this._dateAdjacentForeground;
                displayDay = day - this._monthData.daysInMonth;
            } else {
                if (this._date.day == day) {
                    Echo.Sync.Color.render(this._dateSelectedBackground, cellDiv, "backgroundColor");
                    Echo.Sync.Color.render(this._dateSelectedForeground, cellDiv, "color");
                    Echo.Sync.FillImage.render(this._dateSelectedBackgroundImage, cellDiv);
                    Echo.Sync.Border.render(this._dateSelectedBorder, cellDiv);
                }
                displayDay = day;
            }
            
            cellDiv.appendChild(document.createTextNode(displayDay));

            rowDiv.appendChild(cellDiv);
        }
        return rowDiv;
    },
    
    /**
     * Returns the cell DIV for the specified cell index.
     * 
     * @param {Number} cellIndex the cell index (0 = upper left)
     * @return the DIV element
     * @type Element
     */
    _getCell: function(cellIndex) {
        return this._dayContainerDiv.childNodes[Math.floor(cellIndex / 7)].childNodes[cellIndex % 7];
    },
    
    /**
     * Loads rendering information from component into local object.
     * Calculates required sizes for day elements.
     */
    _loadRenderData: function() {
        this._font = this.component.render("font", Extras.Sync.CalendarSelect.DEFAULTS.font);
        
        // Default Cell Style
        this._dateBackground = this.component.render("dateBackground", Extras.Sync.CalendarSelect.DEFAULTS.dateBackground);
        this._dateBorder = this.component.render("dateBorder", Extras.Sync.CalendarSelect.DEFAULTS.dateBorder);
        this._dateBackgroundImage = this.component.render("dateBackgroundImage");
        this._dateForeground = this.component.render("dateForeground", Extras.Sync.CalendarSelect.DEFAULTS.dateForeground);
        
        // Selected Cell Style
        this._dateSelectedBackground = this.component.render("selectedDateBackground", 
                Extras.Sync.CalendarSelect.DEFAULTS.selectedDateBackground);
        this._dateSelectedBackgroundImage = this.component.render("selectedDateBackgroundImage");
        this._dateSelectedBorder = this.component.render("selectedDateBorder");
        this._dateSelectedForeground = this.component.render("selectedDateForeground",
                Extras.Sync.CalendarSelect.DEFAULTS.selectedDateForeground);
        
        // Rollover Cell Style
        this._dateRolloverBackground = this.component.render("rolloverDateBackground");
        this._dateRolloverBackgroundImage = this.component.render("rolloverDateBackgroundImage");
        this._dateRolloverBorder = this.component.render("rolloverDateBorder");
        this._dateRolloverForeground = this.component.render("rolloverDateForeground");
        if (!this._dateRolloverBackground) {
            this._dateRolloverBackground = Echo.Sync.Color.adjust(this._dateBackground, 0x20, 0x20, 0x20);
        }
        
        // Adjacent Cell Style
        this._dateAdjacentForeground = this.component.render("adjacentMonthDateForeground", 
                Extras.Sync.CalendarSelect.DEFAULTS.adjacentMonthDateForeground);
        this._dateAdjacentBackground = this.component.render("adjacentMonthDateBackground");
        
        // Measure size of date cell text
        var cellMeasure = document.createElement("span");
        cellMeasure.appendChild(document.createTextNode("96"));
        Echo.Sync.Font.render(this._font, cellMeasure);
        var cellBounds = new Core.Web.Measure.Bounds(cellMeasure);

        // FIXME hardcoded
        this._padding = { top: 2, bottom: 2, left: 4, right: 4 };
        this._borderSize = { top: 1, bottom: 1, left: 1, right: 1 };
        
        // Calculate cell size
        this._cellWidth = cellBounds.width + this._padding.left + this._padding.right + 
                this._borderSize.left + this._borderSize.right;
        if (this._cellWidth * 7 < this._monthYearWidth) {
            this._cellWidth = Math.ceil(this._monthYearWidth / 7);
        }
        this._cellHeight = cellBounds.height + this._padding.top + this._padding.bottom +
                this._borderSize.top + this._borderSize.bottom;
        this._hCellSpacing = 0;
        this._vCellSpacing = 0;
        this._headerHeight = cellBounds.height;
        this._headerMargin = 0;
        
        this._xSize = 7;
        this._ySize = 6;
        
        this._rowWidth = this._xSize * this._cellWidth + (this._xSize - 1) * this._hCellSpacing;
        this._calendarHeight = this._ySize * this._cellHeight + (this._ySize - 1) * this._vCellSpacing + 
                this._headerHeight + this._headerMargin;
        
        this._renderedCellWidth = this._cellWidth - this._borderSize.left - this._borderSize.right - 
                this._padding.left - this._padding.right;
        this._renderedCellHeight = this._cellHeight - this._borderSize.top - this._borderSize.bottom - 
                this._padding.top - this._padding.bottom;
    },
    
    /**
     * Processes a date rollover enter event.
     * 
     * @param e the event
     */
    _processDateRolloverEnter: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || e.target._cellIndex == null || this._animation) {
            return;
        }
        if (this._rolloverCellIndex != null) {
            this._setCellStyle(this._rolloverCellIndex, false);
        }
        this._rolloverCellIndex = e.target._cellIndex;
        this._setCellStyle(this._rolloverCellIndex, true);
    },
    
    /**
     * Processes a date rollover exit event.
     * 
     * @param e the event
     */
    _processDateRolloverExit: function(e) {
        if (this._rolloverCellIndex) {
            this._setCellStyle(this._rolloverCellIndex, false);
            this._rolloverCellIndex = null;
        }
    },
    
    /**
     * Processes a date selection (click) event.
     * 
     * @param e the event
     */
    _processDateSelect: function(e) {
        if (!this.client || !this.client.verifyInput(this.component) || e.target._cellIndex == null || this._animation) {
            return;
        }
        this._setDate(this._monthData.getCellDate(e.target._cellIndex));
    },
    
    /**
     * Processes a month selection event.
     * 
     * @param e the event
     */
    _processMonthSelect: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            this._monthSelect.selectedIndex = this._date.month;
            return;
        }        
        this._setDate({ year: this._date.year, month: this._monthSelect.selectedIndex, day: this._date.day });
    },
    
    /**
     * Processes a year input field change event.
     * 
     * @param e the event
     */
    _processYearChange: function(e) {
        var newValue = parseInt(this._yearField.value, 10);
        if (!this.client || !this.client.verifyInput(this.component) || isNaN(newValue)) {
            this._yearField.value = this._date.year;
            return;
        }
        this._setDate({ year: newValue, month: this._date.month, day: this._date.day });
    },

    /**
     * Processes a year input field key-up event.
     * 
     * @param e the event
     */
    _processYearKeyUp: function(e) {
        if (e.keyCode == 13) {
            this._processYearChange(e);
        }
    },
    
    /**
     * Processes a year decrement button click event.
     * 
     * @param e the event
     */
    _processYearDecrement: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        this._setDate({ year: this._date.year - 1, month: this._date.month, day: this._date.day });
    },

    /**
     * Processes a year increment button click event.
     * 
     * @param e the event
     */
    _processYearIncrement: function(e) {
        if (!this.client || !this.client.verifyInput(this.component)) {
            return;
        }
        this._setDate({ year: this._date.year + 1, month: this._date.month, day: this._date.day });
    },
    
    /**
     * Validates the specified date object (containing month/year/day properties to be within the constrained range.
     * The date will be adjusted (if necessary) to comply with the constrained range.
     * 
     * @param date a date object containing month/day/year numeric properties
     */
    _rangeCheck: function(date) {
        if (date.year < Extras.Sync.CalendarSelect.MINIMUM_YEAR) {
            date.year = Extras.Sync.CalendarSelect.MINIMUM_YEAR;
        } else if (date.year > Extras.Sync.CalendarSelect.MAXIMUM_YEAR) {
            date.year = Extras.Sync.CalendarSelect.MAXIMUM_YEAR;
        }
    },
    
    /** @see Echo.Render.ComponentSync#renderAdd */
    renderAdd: function(update, parentElement) {
        update = null; // Update is forcibly set to null, as this method may in some circumstances be invoked internally with
                       // a null update.
        
        this._msg = Extras.Sync.CalendarSelect.resource.get(this.component.getRenderLocale());
        this._icons = { };

        var i, j, td, tr, x, cellDiv, dayOfWeekName, monthYearDiv, headerWidth,
            enabled = this.component.isRenderEnabled(),
            dayOfWeekNameAbbreviationLength = parseInt(this.component.render("dayOfWeekNameAbbreviationLength", 2), 10),
            date = this.component.get("date");

        this._firstDayOfWeek = parseInt(this.component.render("firstDayOfWeek", this._msg["FirstDayOfWeek"]), 10) || 0;

        if (!date) {
            date = new Date();
        }

        this._date = { 
             year: date.getFullYear(), 
             month: date.getMonth(), 
             day: date.getDate()
        };
        this._monthData = new Extras.Sync.CalendarSelect.MonthData(this._date.year, this._date.month, this._firstDayOfWeek);    

        this._monthYearInput = this._createMonthYearInput();
        this._monthYearWidth = new Core.Web.Measure.Bounds(this._monthYearInput).width + 10; //FIXME hardcoded.
    
        this._loadRenderData();

        this._div = document.createElement("div");
        this._div.id = this.component.renderId;
        this._div.style.cssText = "text-align:left;width:" + (this._cellWidth * this._xSize) + "px;";
        
        Echo.Sync.LayoutDirection.render(this.component.getLayoutDirection(), this._div);
        Echo.Sync.Font.render(this._font, this._div);
        Echo.Sync.Color.render(this.component.render("foreground", Extras.Sync.CalendarSelect.DEFAULTS.foreground), this._div,
                "color");
        Echo.Sync.Color.render(this.component.render("background", Extras.Sync.CalendarSelect.DEFAULTS.background), this._div,
                "backgroundColor");
        Echo.Sync.FillImage.render(this.component.render("backgroundImage"), this._div);
        Echo.Sync.Border.render(this.component.render("border",  Extras.Sync.CalendarSelect.DEFAULTS.border), this._div);
        Echo.Sync.Font.render(this.component.render("font"), this._div);
        
        monthYearDiv = document.createElement("div");
        monthYearDiv.align = "center";
        monthYearDiv.style.cssText = "padding:2px 5px;white-space:nowrap;overflow:hidden;"; //FIXME hardcoded
        monthYearDiv.appendChild(this._monthYearInput);
        this._div.appendChild(monthYearDiv);
        
        this._calendarDiv = document.createElement("div");
        this._calendarDiv.style.cssText = "position:relative;";

        this._calendarDiv.style.width = this._rowWidth + "px";
        this._calendarDiv.style.height = this._calendarHeight + "px";
        this._div.appendChild(this._calendarDiv);
        
        this._currentRowDivs = [];
        
        var headerDiv = document.createElement("div");
        headerDiv.style.cssText = "position:absolute;";
        headerDiv.style.width = (this._cellWidth * 7) + "px";
        headerDiv.style.height = this._headerHeight + "px";
        Echo.Sync.Color.render(this.component.render("headerForeground", Extras.Sync.CalendarSelect.DEFAULTS.foreground), headerDiv,
                "color");
        Echo.Sync.Color.render(this.component.render("headerBackground", Extras.Sync.CalendarSelect.DEFAULTS.background), headerDiv,
                "backgroundColor");
        Echo.Sync.FillImage.render(this.component.render("headerBackgroundImage"), headerDiv);
        this._calendarDiv.appendChild(headerDiv);
        
        for (x = 0; x < this._xSize; ++x) {
            cellDiv = document.createElement("div");
            cellDiv.style.cssText = "position:absolute;text-align:center;";
            cellDiv.style.left = (x * (this._cellWidth + this._hCellSpacing)) + "px";
            cellDiv.style.width = this._cellWidth + "px";
            cellDiv.style.height = this._headerHeight + "px";
            cellDiv.style.overflow = "hidden";
            
            dayOfWeekName = this._msg["DayOfWeek." + ((this._firstDayOfWeek + x) % 7)];
            if (dayOfWeekNameAbbreviationLength > 0) {
                dayOfWeekName = dayOfWeekName.substring(0, dayOfWeekNameAbbreviationLength);
            }
            cellDiv.appendChild(document.createTextNode(dayOfWeekName));
            
            headerDiv.appendChild(cellDiv);
        }
        
        this._scrollContainer = document.createElement("div");
        this._scrollContainer.style.cssText = "position:absolute;overflow:hidden;";
        this._scrollContainer.style.top = (this._headerHeight + this._headerMargin) + "px";
        this._scrollContainer.style.height = (this._ySize * this._cellHeight + (this._ySize - 1) * this._vCellSpacing) + "px";
        this._scrollContainer.style.width = this._rowWidth + "px";
        Echo.Sync.Color.render(this._dateForeground, this._scrollContainer, "color");
        Echo.Sync.Color.render(this._dateBackground, this._scrollContainer, "backgroundColor");
        Echo.Sync.FillImage.render(this._dateBackgroundImage, this._scrollContainer);
        this._calendarDiv.appendChild(this._scrollContainer);
        
        this._dayContainerDiv = this._createDayContainer();
        this._scrollContainer.appendChild(this._dayContainerDiv);
                
        parentElement.appendChild(this._div);

        Core.Web.Event.add(this._monthSelect, "change", Core.method(this, this._processMonthSelect), false);
        Core.Web.Event.add(this._yearField, "change", Core.method(this, this._processYearChange), false);
        Core.Web.Event.add(this._yearField, "keyup", Core.method(this, this._processYearKeyUp), false);
        Core.Web.Event.add(this._yearDecSpan, "click", Core.method(this, this._processYearDecrement), false);
        Core.Web.Event.add(this._yearIncSpan, "click", Core.method(this, this._processYearIncrement), false);
        Core.Web.Event.add(this._calendarDiv, "click", Core.method(this, this._processDateSelect), false);
        Core.Web.Event.add(this._calendarDiv, "mouseover", Core.method(this, this._processDateRolloverEnter), false);
        Core.Web.Event.add(this._calendarDiv, "mouseout", Core.method(this, this._processDateRolloverExit), false);

        this._updateMonthYearSelection();
        
        Core.Web.Image.monitor(this._div, Core.method(this, function() {
            this._renderSizeUpdate();
        }));
    },
    
    /** @see Echo.Render.ComponentSync#renderDispose */
    renderDispose: function(update) {
        update = null; // Update is forcibly set to null, as this method may in some circumstances be invoked internally with
                       // a null update.

        Core.Web.Event.removeAll(this._monthSelect);
        Core.Web.Event.removeAll(this._yearField);
        Core.Web.Event.removeAll(this._yearDecSpan);
        Core.Web.Event.removeAll(this._yearIncSpan);
        Core.Web.Event.removeAll(this._calendarDiv);
    
        this._div = null;
        this._monthSelect = null;
        this._yearField = null;
        this._yearDecSpan = null;
        this._yearIncSpan = null;
        this._dayContainerDiv = null;
        this._scrollContainer = null;
        this._calendarDiv = null;
        this._monthYearInput = null;
    },
    
    /**
     * Detects if the CalendarSelect is properly sized (i.e., as a result of additional images having been loaded) and
     * re-renders it if required.
     */
    _renderSizeUpdate: function() {
        var monthYearWidth = new Core.Web.Measure.Bounds(this._monthYearInput).width + 10;  //FIXME hardcoded.
        if (this._monthYearWidth === monthYearWidth) {
            return;
        }
        
        // Perform full render if required.
        var element = this._div;
        var containerElement = element.parentNode;
        this.renderDispose(null);
        containerElement.removeChild(element);
        this.renderAdd(null, containerElement);
    },
    
    /** @see Echo.Render.ComponentSync#renderUpdate */
    renderUpdate: function(update) {
        if (update && update.isUpdatedPropertySetIn({date: true })) {
            var date = this.component.get("date") || new Date();
            if (this._date.month == date.getMonth() && this._date.day == date.getDate() && this._date.year == date.getFullYear()) {
                 return false;
            }
        }

        // Full Render
        if (this._animation) {
            this._animation.abort();
        }
        var element = this._div;
        var containerElement = element.parentNode;
        Echo.Render.renderComponentDispose(update, update.parent);
        containerElement.removeChild(element);
        this.renderAdd(update, containerElement);
        return false;
    },
    
    /**
     * Sets the style of a specific day cell.
     * 
     * @param {Number} cellIndex the cell index (0 = upper-left)
     * @param {Boolean} rollover flag indicating whether the mouse is currently rolled over the cell
     * @param {Boolean} reset flag indicating whether the cell should be reset to its default state
     */
    _setCellStyle: function(cellIndex, rollover, reset) {
        var date = this._monthData.getCellDate(cellIndex);
        var cell = this._getCell(cellIndex);
        if (!reset && date.day == this._date.day && date.month == this._date.month && date.year == this._date.year) {
            // Render selected
            Echo.Sync.Color.renderClear(this._dateSelectedBackground, cell, "backgroundColor");
            Echo.Sync.Color.renderClear(this._dateSelectedForeground, cell, "color");
            Echo.Sync.FillImage.render(this._dateSelectedBackgroundImage, cell);
            Echo.Sync.Border.render(this._dateSelectedBorder, cell);
        } else if (!reset && rollover) {
            // Render rollover
            Echo.Sync.Color.renderClear(this._dateRolloverBackground, cell, "backgroundColor");
            Echo.Sync.Color.renderClear(this._dateRolloverForeground, cell, "color");
            Echo.Sync.FillImage.render(this._dateRolloverBackgroundImage, cell);
            Echo.Sync.Border.render(this._dateRolloverBorder, cell);
        } else {
            if (this._monthData.isCellAdjacent(cellIndex)) {
                // Render adjacent
                Echo.Sync.Color.renderClear(this._dateAdjacentBackground, cell, "backgroundColor");
                Echo.Sync.Color.renderClear(this._dateAdjacentForeground, cell, "color");
            } else {
                // Render default
                Echo.Sync.Border.renderClear(this._dateBorder, cell);
                cell.style.backgroundImage = "";
                cell.style.backgroundColor = "";
                cell.style.color = "";
            }
        }
    },
    
    /**
     * Sets the selected date.  Updates month/year fields and animates in new month/year if required.
     * 
     * @param newValue an object providing month, day, and year numeric properties
     */
    _setDate: function(newValue) {
        var oldValue = this._date,
            oldCellIndex = this._monthData.getCellIndex(this._date.day),
            newCellIndex,
            overlap;

        this._setCellStyle(oldCellIndex, false, true);
        
        this._rangeCheck(newValue);
        this._date = newValue;

        this._monthData = new Extras.Sync.CalendarSelect.MonthData(newValue.year, newValue.month, this._firstDayOfWeek);

        if (newValue.year == oldValue.year) {
            if (newValue.month == oldValue.month) {
                // Day Change
                newCellIndex = this._monthData.getCellIndex(this._date.day);
                this._setCellStyle(newCellIndex, false);
            } else {
                // Month/Day Change
                if (oldValue.month - newValue.month == 1) {
                    // Displaying previous month.
                    overlap = this._monthData.nextMonthWeek == 4 ? 2 : 1;
                } else if (oldValue.month - newValue.month == -1) {
                    // Displaying next month.
                    var oldMonthData = new Extras.Sync.CalendarSelect.MonthData(oldValue.year, oldValue.month,
                            this._firstDayOfWeek);
                    overlap = oldMonthData.nextMonthWeek == 4 ? 2 : 1;
                } else {
                    overlap = 0;
                }
                this._animateUpdate(true, oldValue.month < newValue.month, overlap);
            }
        } else {
            // Year/Month/Day Change
            this._animateUpdate(false, oldValue.year < newValue.year);
        }
        
        this._updateMonthYearSelection();
        
        this._storeValue();
        
        this.component.doAction();
    },
    
    /**
     * Stores the selected date in the <code>Echo.Component</code> instance.
     */
    _storeValue: function() {
        this.component.set("date", new Date(this._date.year, this._date.month, this._date.day));
    },
    
    /**
     * Updates the month/year field selection values.
     */
    _updateMonthYearSelection: function() {
        if (parseInt(this._yearField.value, 10) !== this._date.year) {
            this._yearField.value = this._date.year;
        }
        if (this._monthSelect.selectedIndex != this._date.month) {
            this._monthSelect.selectedIndex = this._date.month;
        }
    }
});    
