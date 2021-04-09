import i18next from 'i18next';

/**
 * @param year - a number, the year of the date to be formatted
 * @param month - a number between 1 and 12 (inclusive)
 * @param day - a number between 1 and 31 (inclusive)
 * @returns a string for the date written as 'month/day/year' if the current language is English and written as 'day/month/year' if the current language is Spanish
 */
function formatDate(year: number, month: number, day: number): string {
  let formattedDate = '';
  // In American English, the month goes first
  if (i18next.language === 'en') {
    formattedDate = month + '/' + day + '/' + year;
  } else {
    // In Spanish, the day goes first
    formattedDate = day + '/' + month + '/' + year;
  }
  return formattedDate;
}

/**
 * @param hour - a number between 0 and 24 (inclusive)
 * @param minutes - a number between 1 and 60 (inclusive)
 * @returns a string for the time written as 'hour:minute AM/PM' (ex: '12:42 AM')
 */
function formatTime(hour: number, minutes: number): string {
  const hoursPerPeriod = 12;
  const hoursPerDay = 24;

  let period = ' AM';
  if (hour === hoursPerDay) {
    period = 'AM';
    hour = hoursPerPeriod;
  } else if (hour >= hoursPerPeriod) {
    period = ' PM';
    hour = hour % hoursPerPeriod;
  }
  let leadingZero = '';
  /* eslint-disable-next-line no-magic-numbers */
  if (minutes < 10) {
    leadingZero = '0';
  }
  // Between 12:00 AM and 12:59 AM, the hour value is 0, but we want to display 12
  if (hour === 0) {
    hour = hoursPerPeriod;
  }
  const formattedTime: string = hour + ':' + leadingZero + minutes + period;
  return formattedTime;
}

export {formatDate, formatTime};
