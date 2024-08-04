let months = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
let chart = document.querySelector("#barChart");

months.forEach((item) => {
  chart.innerHTML += `
    <div class="label">
        <div class="bar-line">
            <div class="expenditure_${item}"></div>
            <div class="savings_${item}"></div>
        </div>
        <small class="roboto-bold">${item}</small>
   </div>
  `;
});
function getSum(balance, transaction) {
  return (
    parseInt(balance) + transaction.reduce((acc, curr) => acc + curr.amount, 0)
  );
}
function formatNumber(num) {
  if (!isNaN(num)) {
    let numParts = Math.abs(num).toString().split(".");
    numParts[0] = numParts[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
    return numParts.join(".");
  }
  return 0;
}
$(document).ready(function () {
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let getBalance = localStorage.getItem("totalBalance") || 0;
  if (getBalance == null || getBalance == 0) {
    let totalBalance = prompt("What is your total balance?");
    localStorage.setItem("totalBalance", parseInt(totalBalance));
    displayTransactions();
  }
  $("#balance").html(`&#x20b9; ${formatNumber(+getBalance)}`);

  // Function to display transactions
  function displaySavings() {
    let filteredTransactions = transactions;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    let recieve = filteredTransactions.filter((transaction) => {
      return transaction.transactionType === "recieve";
    });
    let spend = filteredTransactions.filter((transaction) => {
      return transaction.transactionType === "spend";
    });
    let receiveSum = recieve.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Calculate sum of spend transactions
    let spendSum = spend.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0
    );

    let expensePercentile = Math.floor((spendSum / receiveSum) * 100);
    let savingsPercentile =
      Math.ceil(((receiveSum - spendSum) / receiveSum) * 100);
    $(`.savings_${months[currentMonth]}`).css(
      "height",
      `${savingsPercentile}%`
    );
    $(`.expenditure_${months[currentMonth]}`).css(
      "height",
      `${expensePercentile}%`
    );
    $(`.expenditure_${months[currentMonth]}`).prop(
      "title",
      `${expensePercentile}%`
    );
    $(`.savings_${months[currentMonth]}`).prop(
      "title",
      `${savingsPercentile}%`
    );
    $("#savings").html(`&#x20b9; ${formatNumber(receiveSum - spendSum)}`);
    $("#expenses").html(`&#x20b9; ${formatNumber(spendSum)}`);

    console.log(savingsPercentile, expensePercentile);
  }

  function displayTransactions() {
    const $list = $("#transactions");
    // if($list.length > 0) {
    //   $("#showAllTrans").props("disabled", "false")
    // }
    let balance;
    $list.empty();

    transactions?.forEach((transaction, index) => {
      const formattedAmount = formatNumber(Math.abs(transaction.amount));
      const amountDisplay =
        transaction.amount < 0
          ? `-₹${formattedAmount}`
          : `+₹${formattedAmount}`;
      $list.append(`
          <li class="transaction-item ${transaction.transactionType}">
                  <div>
                      <h4 id="title">${transaction.transactionType}</h4>
                      <small id="memo">${transaction.memo}</small>
                  </div>
                  <strong id="amount">${amountDisplay}</strong>
              </li>`);
    });

    let invested = transactions.filter(
      (transaction) => transaction.transactionType == "invest"
    );

    $("#investment").html(`&#x20b9; ${formatNumber(getSum(0, invested))}`);
    $("#balance").html(
      `&#x20b9; ${formatNumber(getSum(getBalance, transactions))}`
    );
  }

  // Display transactions on page load
  displayTransactions();
  displaySavings();
  // Open modal
  $("#openModal").click(function () {
    $("#myModal").css("display", "flex");
  });

  // Close modal when clicking outside
  $(window).click(function (event) {
    if (event.target == $("#myModal")[0]) {
      $("#myModal").css("display", "none");
    }
  });
  $("#close").click(function () {
    $("#myModal").css("display", "none");
  });

  // Add or remove minus sign when transaction type changes
  $("#selectOption").change(function () {
    if ($(this).val() === "spend") {
      $("#amountInputWrapper").addClass("spend");
    } else {
      $("#amountInputWrapper").removeClass("spend");
    }
  });

  // Form submission
  let values = [];
  $("#modalForm").submit(function (e) {
    e.preventDefault();
    var selectValue = $("#selectOption").val();
    var numberValue = parseFloat($("#numberInput").val());
    var dateValue = $("#date").val();
    var memoValue = $("#memoInput").val();

    // Convert to negative if "Spend" is selected
    if (selectValue === "spend") {
      numberValue = Math.abs(numberValue) * -1;
    }
    const transaction = {
      transactionType: selectValue,
      amount: numberValue,
      memo: memoValue,
      date: new Date(dateValue)
    };

    // Add to transactions array
    transactions.push(transaction);

    // Save to localStorage
    localStorage.setItem("transactions", JSON.stringify(transactions));

    // Update display
    displayTransactions();
    displaySavings();
    // Close the modal after submission
    $("#myModal").css("display", "none");

    // Reset form
    this.reset();
    $("#amountInputWrapper").removeClass("spend");
  });
});
