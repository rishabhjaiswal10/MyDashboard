function resizeCanvas(canvas, newWidth, newHeight) {
  canvas.width = newWidth;
  canvas.height = newHeight;
  // Redraw content here if needed
}

// Get all canvas elements with class "grid-item"
const canvases = document.querySelectorAll('.grid-item');

// Resize all canvases to the desired size (e.g., 200x200)
const canvasWidth = 200;
const canvasHeight = 200;

canvases.forEach((canvas) => {
  resizeCanvas(canvas, canvasWidth, canvasHeight);
});

let filename = 'dataset.csv';

d3.csv(filename).then(function(data) {
    // Count the total number of unique users
    const uniqueUserID = new Set(data.map(item => item[" User_ID "]));
    document.getElementById("totalUsers").innerHTML = uniqueUserID.size;
    const totalUniqueUsers = uniqueUserID.size;
    console.log("Total unique users:", totalUniqueUsers);

    // Count the total number of unique windows
    const uniqueWindowName = new Set(data.map(item => item[" Activity_Window_Name "]));
    document.getElementById("Windows").innerHTML = uniqueWindowName.size;
    const totalUniqueWindows = uniqueWindowName.size;
    console.log("Total unique windows:", totalUniqueWindows);

  // The data array is available inside this block
  console.log(data); // Check the entire data array to verify its contents

  const userWindowMap = new Map();
  const uniqueUserIDs = Array.from(new Set(data.map(item => item[" User_ID "])));
  const uniqueWindowNames = Array.from(new Set(data.map(item => item[" Activity_Window_Name "])));

  uniqueUserIDs.forEach(userID => {
    const userData = data.filter(item => item[" User_ID "] === userID);
    const timeData = uniqueWindowNames.map(windowName => {
      const windowData = userData.find(item => item[" Activity_Window_Name "] === windowName);
      return windowData ? parseInt(windowData[" Activity_Window_Time "]) : 0;
    });

    userWindowMap.set(userID, timeData);
  });
  
  // Prepare data for the stacked bar chart
  const blueShades = [
    'rgba(0, 102, 204, 0.8)',
    'rgba(0, 128, 255, 0.8)',
    'rgba(0, 153, 255, 0.8)',
    'rgba(51, 153, 255, 0.8)',
    'rgba(102, 153, 255, 0.8)',
    'rgba(0, 204, 255, 0.8)',
    'rgba(51, 204, 255, 0.8)',
    'rgba(0, 51, 102, 0.8)',   // Dark Blue
    'rgba(0, 77, 153, 0.8)',   // Medium Blue
    'rgba(0, 153, 204, 0.8)'   // Teal Blue
  ];
  const stackedData = uniqueWindowNames.map((windowName, index) => {

    return {
      label: windowName,
      data: uniqueUserIDs.map(userID => userWindowMap.get(userID)[index]),
      backgroundColor: blueShades[index % blueShades.length]
    };
  });

  // Create a stacked bar chart for User vs. Time with Windows stacked
  var ctxStacked = document.getElementById('stackedBarChart').getContext('2d');
  var stackedBarChart = new Chart(ctxStacked, {
    type: 'bar',
    data: {
      labels: uniqueUserIDs.map(userID => `${userID}`),
      datasets: stackedData
    },
    options: {
      scales: {
        x: {
          grid: {
            display: true, // Hide the gridlines for X axis
          },
          ticks: {
            color: 'black', // Set the color for X axis labels and line
          },
          stacked: true,
        },
        y: {
          grid: {
            display: false, // Hide the gridlines for X axis
          },
          ticks: {
            color: 'black', // Set the color for X axis labels and line
          },
          stacked: true,
          beginAtZero: true
        }
      }
    }
  });

  const userMap = new Map();
  const userOccurrences = new Map();
  data.forEach(item => {
    const userID = item[" User_ID "];
    const activityTime = parseInt(item[" Activity_Window_Time "]);
    if (userMap.has(userID)) {
      userMap.set(userID, userMap.get(userID) + activityTime);
      userOccurrences.set(userID, userOccurrences.get(userID) + 1);
    } else {
      userMap.set(userID, activityTime);
      userOccurrences.set(userID, 1);
    }
  });

  const userLabels = Array.from(userMap.keys());
  const userActivityTimes = Array.from(userMap.values()).map((sum, index) => sum );

  // Create a bar chart for User ID
  var ctxUser = document.getElementById('barChartUser').getContext('2d');
  var barChartUser = new Chart(ctxUser, {
    type: 'bar',
    data: {
      labels: userLabels,
      datasets: [{
        label: 'Users',
        data: userActivityTimes,
        backgroundColor: 'rgba(30, 144, 255, 0.8)',  
        borderColor: '#FF6384',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false, // Hide the gridlines for X axis
          },
          ticks: {
            color: 'black', // Set the color for X axis labels and line
          },
        },
        y: {
          beginAtZero: true,

          grid: {
            display: false, // Hide the gridlines for X axis
          },
          ticks: {
            color: 'black', // Set the color for X axis labels and line
          },
        }
      }
    }
  });

  var ctx = document.getElementById('pieChartUser').getContext('2d');
var pieChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: userLabels,
    datasets: [{
      data: userActivityTimes,
      backgroundColor: [
        'rgba(0, 0, 255, 0.8)',
        'rgba(0, 0, 128, 0.8)',     
        'rgba(0, 128, 255, 0.8)',   
        'rgba(0, 191, 255, 0.8)',
        'rgba(70, 130, 180, 0.8)',  
        'rgba(0, 0, 139, 0.8)',     
        'rgba(30, 144, 255, 0.8)',  
        'rgba(0, 0, 205, 0.8)',     
        'rgba(65, 105, 225, 0.8)',  
        'rgba(25, 25, 112, 0.8)'    
        // Add more colors for each label if needed
      ],
      // borderColor: white,
      borderColor: "black",
      borderWidth: 1,
      
    }]
  },
  options: {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'left',
      },
      // title: {
      //   display: true,
      //   text: 'Total Time Spent By Users'
      // }
    }
  }
});

  // Calculate the average time for each unique window name
  const windowMap = new Map();
  data.forEach(item => {
    const windowName = item[" Activity_Window_Name "];
    const activityTime = parseInt(item[" Activity_Window_Time "]);
    if (windowMap.has(windowName)) {
      windowMap.set(windowName, windowMap.get(windowName) + activityTime);
    } else {
      windowMap.set(windowName, activityTime);
    }
  });

  const labels = Array.from(windowMap.keys());
  const activityTimes = Array.from(windowMap.values()).map(sum => sum);

  // Create a bar chart
  var ctxWindow = document.getElementById('barChart').getContext('2d');
  var barChart = new Chart(ctxWindow, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Windows',
        data: activityTimes,
        backgroundColor: 'rgba(65, 105, 225, 0.8)', 
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x:{
          grid: {
            display: false, // Hide the gridlines for X axis
          },
          ticks: {
            color: 'black', // Set the color for X axis labels and line
          },
        },
        y: {
          grid: {
            display: false, // Hide the gridlines for X axis
          },
          ticks: {
            color: 'black', // Set the color for X axis labels and line
          },
          beginAtZero: true
        }
      }
    }
  });

  // Add an event listener to the "barChart" canvas for the "Windows" bar chart
ctxWindow.canvas.addEventListener("click", function (event) {
  const activePoints = barChart.getElementsAtEventForMode(event, "nearest", {
    intersect: true,
  });

  if (activePoints.length > 0) {
    const clickedIndex = activePoints[0].index;
    const selectedWindowName = labels[clickedIndex]; // Use the window labels
    updateUserCharts(selectedWindowName);
  }
});

  var ctx = document.getElementById('pieChart').getContext('2d');
var pieChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: labels,
    datasets: [{
      data: activityTimes,
      backgroundColor: [
        'rgba(0, 0, 255, 0.8)',
        'rgba(0, 0, 128, 0.8)',     
        'rgba(0, 128, 255, 0.8)',   
        'rgba(0, 191, 255, 0.8)',
        'rgba(70, 130, 180, 0.8)',  
        'rgba(0, 0, 139, 0.8)',     
        'rgba(30, 144, 255, 0.8)',  
        'rgba(0, 0, 205, 0.8)',     
        'rgba(65, 105, 225, 0.8)',  
        'rgba(25, 25, 112, 0.8)'    
        // Add more colors for each label if needed
      ],
      borderColor: "black",
      borderWidth: 1,
    }]
  },
  options: {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'left',
      },
      // title: {
      //   display: true,
      //   text: 'Total Time Spent on Windows',
      //   font: 24,
      // }
    }
  }
});
// ... (existing code)

// Store the original data for the "barChart" and "pieChart"
const originalBarChartData = {
  labels: labels,
  data: activityTimes,
};

const originalPieChartData = {
  labels: labels,
  data: activityTimes,
};

// Add an event listener to the "barChartUser" canvas
ctxUser.canvas.addEventListener("click", function (event) {
  const activePoints = barChartUser.getElementsAtEventForMode(event, "nearest", {
    intersect: true,
  });

  if (activePoints.length > 0) {
    const clickedIndex = activePoints[0].index;
    const selectedUserID = userLabels[clickedIndex];
    updateWindowCharts(selectedUserID);
  }
});

// Function to update the window charts based on the selected user ID
function updateWindowCharts(selectedUserID) {
  // resetUserCharts();
  const userWindowsData = data.filter(
    (item) => item[" User_ID "] === selectedUserID
  );

  const windowMap = new Map();
  userWindowsData.forEach((item) => {
    const windowName = item[" Activity_Window_Name "];
    const activityTime = parseInt(item[" Activity_Window_Time "]);
    if (windowMap.has(windowName)) {
      windowMap.set(windowName, windowMap.get(windowName) + activityTime);
    } else {
      windowMap.set(windowName, activityTime);
    }
  });

  const labels = Array.from(windowMap.keys());
  const activityTimes = Array.from(windowMap.values()).map((sum) => sum);

  // Update the data and labels for the "barChart"
  barChart.data.labels = labels;
  barChart.data.datasets[0].data = activityTimes;
  barChart.update();

  // Update the data and labels for the "pieChart"
  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = activityTimes;
  pieChart.update();
}

// Function to reset the window charts to the original state
function resetWindowCharts() {
  barChart.data.labels = originalBarChartData.labels;
  barChart.data.datasets[0].data = originalBarChartData.data;
  barChart.update();

  pieChart.data.labels = originalPieChartData.labels;
  pieChart.data.datasets[0].data = originalPieChartData.data;
  pieChart.update();
}


// ...
// Store the original data for the "barChartUser" and "pieChartUser"
const originalBarChartUserData = {
  labels: userLabels,
  data: userActivityTimes,
};

const originalPieChartUserData = {
  labels: userLabels,
  data: userActivityTimes,
};

  // Add an event listener to the "barChart" canvas for the "Windows" bar chart
  ctx.canvas.addEventListener("click", function (event) {
    const activePoints = barChart.getElementsAtEventForMode(event, "nearest", {
      intersect: true,
    });
  
    if (activePoints.length > 0) {
      const clickedIndex = activePoints[0].index;
      const selectedWindowName = labels[clickedIndex]; // Use the window labels
      updateUserCharts(selectedWindowName);
    }
  });

// Function to update the user charts based on the selected window name
function updateUserCharts(selectedWindowName) {
  // resetWindowCharts();
  const windowUserData = data.filter(
    (item) => item[" Activity_Window_Name "] === selectedWindowName
  );

  const userMap = new Map();
  windowUserData.forEach((item) => {
    const userID = item[" User_ID "];
    const activityTime = parseInt(item[" Activity_Window_Time "]);
    if (userMap.has(userID)) {
      userMap.set(userID, userMap.get(userID) + activityTime);
    } else {
      userMap.set(userID, activityTime);
    }
  });

  const userLabels = Array.from(userMap.keys());
  const userActivityTimes = Array.from(userMap.values()).map((sum) => sum);
  
  // Update the data and labels for the "barChartUser"
  barChartUser.data.labels = userLabels;
  barChartUser.data.datasets[0].data = userActivityTimes;
  barChartUser.update();
  
  // Update the data and labels for the "pieChartUser"
  // pieChartUser.data.labels = userLabels;
  // pieChartUser.data.datasets[0].data = userActivityTimes;
  // pieChartUser.update();
}


function resetUserCharts() {
    barChartUser.data.labels = originalBarChartUserData.labels;
    barChartUser.data.datasets[0].data = originalBarChartUserData.data;
    barChartUser.update();

    // pieChartUser.data.labels = originalPieChartUserData.labels;
    // pieChartUser.data.datasets[0].data = originalBarChartUserData.data;
    // pieChartUser.update();
  }

  document.addEventListener("click", function (event) {
    // Get the element that was clicked
    const clickedElement = event.target;
  
    // Check if the clicked element is a descendant of the bar chart canvases or their containers
    const barChartUserCanvas = ctxUser.canvas;
    const barChartCanvas = ctxWindow.canvas;
  
    const isOutsideBothCharts =
      !barChartUserCanvas.contains(clickedElement) &&
      !barChartCanvas.contains(clickedElement);
  
    if (!barChartCanvas.contains(clickedElement)) {
      if(!barChartUserCanvas.contains(clickedElement))
      {
        console.log("rj");
              resetUserCharts();
      resetWindowCharts();
      }

    }
  });
  

});
function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}










// // Function to resize a canvas
// function resizeCanvas(canvas, newWidth, newHeight) {
//   canvas.width = newWidth;
//   canvas.height = newHeight;
//   // Redraw content here if needed
// }

// // Get all canvas elements with class "grid-item"
// const canvases = document.querySelectorAll(".grid-item");

// // Resize all canvases to the desired size (e.g., 200x200)
// const canvasWidth = 200;
// const canvasHeight = 200;

// canvases.forEach((canvas) => {
//   resizeCanvas(canvas, canvasWidth, canvasHeight);
// });

// let filename = "dataset.csv";

// d3.csv(filename).then(function (data) {
//   // Count the total number of unique users
//   const uniqueUserID = new Set(data.map((item) => item[" User_ID "]));
//   document.getElementById("totalUsers").innerHTML = uniqueUserID.size;
//   const totalUniqueUsers = uniqueUserID.size;
//   console.log("Total unique users:", totalUniqueUsers);

//   // Count the total number of unique windows
//   const uniqueWindowName = new Set(
//     data.map((item) => item[" Activity_Window_Name "])
//   );
//   document.getElementById("Windows").innerHTML = uniqueWindowName.size;
//   const totalUniqueWindows = uniqueWindowName.size;
//   console.log("Total unique windows:", totalUniqueWindows);

//   // The data array is available inside this block
//   console.log(data); // Check the entire data array to verify its contents

//   const userWindowMap = new Map();
//   const uniqueUserIDs = Array.from(
//     new Set(data.map((item) => item[" User_ID "]))
//   );
//   const uniqueWindowNames = Array.from(
//     new Set(data.map((item) => item[" Activity_Window_Name "]))
//   );

//   uniqueUserIDs.forEach((userID) => {
//     const userData = data.filter((item) => item[" User_ID "] === userID);
//     const timeData = uniqueWindowNames.map((windowName) => {
//       const windowData = userData.find(
//         (item) => item[" Activity_Window_Name "] === windowName
//       );
//       return windowData ? parseInt(windowData[" Activity_Window_Time "]) : 0;
//     });

//     userWindowMap.set(userID, timeData);
//   });

//   // Prepare data for the stacked bar chart
//   const stackedData = uniqueWindowNames.map((windowName, index) => {
//     return {
//       label: windowName,
//       data: uniqueUserIDs.map((userID) => userWindowMap.get(userID)[index]),
//       backgroundColor: `rgba(${getRandomValue(255)}, ${getRandomValue(
//         255
//       )}, ${getRandomValue(255)}, 0.8)`,
//     };
//   });

//   // Create a stacked bar chart for User vs. Time with Windows stacked
//   var ctxStacked = document.getElementById("stackedBarChart").getContext("2d");
//   var stackedBarChart = new Chart(ctxStacked, {
//     type: "bar",
//     data: {
//       labels: uniqueUserIDs.map((userID) => `${userID}`),
//       datasets: stackedData,
//     },
//     options: {
//       scales: {
//         x: {
//           grid: {
//             display: true, // Hide the gridlines for X axis
//           },
//           ticks: {
//             color: "black", // Set the color for X axis labels and line
//           },
//           stacked: true,
//         },
//         y: {
//           grid: {
//             display: true, // Hide the gridlines for X axis
//           },
//           ticks: {
//             color: "black", // Set the color for X axis labels and line
//           },
//           stacked: true,
//           beginAtZero: true,
//         },
//       },
//     },
//   });

//   const userMap = new Map();
//   const userOccurrences = new Map();
//   data.forEach((item) => {
//     const userID = item[" User_ID "];
//     const activityTime = parseInt(item[" Activity_Window_Time "]);
//     if (userMap.has(userID)) {
//       userMap.set(userID, userMap.get(userID) + activityTime);
//       userOccurrences.set(userID, userOccurrences.get(userID) + 1);
//     } else {
//       userMap.set(userID, activityTime);
//       userOccurrences.set(userID, 1);
//     }
//   });

//   const userLabels = Array.from(userMap.keys());
//   const userActivityTimes = Array.from(userMap.values()).map(
//     (sum, index) => sum
//   );

//   // Create a bar chart for User ID
//   var ctxUser = document.getElementById("barChartUser").getContext("2d");
//   var barChartUser = new Chart(ctxUser, {
//     type: "bar",
//     data: {
//       labels: userLabels,
//       datasets: [
//         {
//           label: "Total Time Spent for Each User",
//           data: userActivityTimes,
//           backgroundColor: "rgba(255, 99, 132, 0.8)",
//           borderColor: "#FF6384",
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       scales: {
//         x: {
//           grid: {
//             display: true, // Hide the gridlines for X axis
//           },
//           ticks: {
//             color: "black", // Set the color for X axis labels and line
//           },
//         },
//         y: {
//           beginAtZero: true,

//           grid: {
//             display: true, // Hide the gridlines for X axis
//           },
//           ticks: {
//             color: "black", // Set the color for X axis labels and line
//           },
//         },
//       },
//     },
//   });

//   var ctx = document.getElementById("pieChartUser").getContext("2d");
//   var pieChart = new Chart(ctx, {
//     type: "pie",
//     data: {
//       labels: userLabels,
//       datasets: [
//         {
//           data: userActivityTimes,
//           backgroundColor: [
//             "rgba(255, 99,32, 0.8)",
//             "rgba(55, 99, 32, 0.8)",
//             "rgba(255, 199, 132, 0.8)",
//             "rgba(25, 99, 132, 0.8)",
//             "rgba(54, 162, 235, 0.8)",
//             "rgba(255, 206, 86, 0.8)",
//             // Add more colors for each label if needed
//           ],
//           borderColor: "black",
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           position: "top",
//         },
//         title: {
//           display: true,
//           text: "Total Time Spent By Users",
//         },
//       },
//     },
//   });

//   // Calculate the average time for each unique window name
//   const windowMap = new Map();
//   data.forEach((item) => {
//     const windowName = item[" Activity_Window_Name "];
//     const activityTime = parseInt(item[" Activity_Window_Time "]);
//     if (windowMap.has(windowName)) {
//       windowMap.set(windowName, windowMap.get(windowName) + activityTime);
//     } else {
//       windowMap.set(windowName, activityTime);
//     }
//   });

//   const labels = Array.from(windowMap.keys());
//   const activityTimes = Array.from(windowMap.values()).map((sum) => sum);

//   // Create a bar chart
//   var ctx = document.getElementById("barChart").getContext("2d");
//   var barChart = new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           label: "Total Time Spent on Windows",
//           data: activityTimes,
//           backgroundColor: "rgba(54, 162, 235, 0.8)",
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       scales: {
//         x: {
//           grid: {
//             display: true, // Hide the gridlines for X axis
//           },
//           ticks: {
//             color: "black", // Set the color for X axis labels and line
//           },
//         },
//         y: {
//           grid: {
//             display: true, // Hide the gridlines for X axis
//           },
//           ticks: {
//             color: "black", // Set the color for X axis labels and line
//           },
//           beginAtZero: true,
//         },
//       },
//     },
//   });

//   // Add an event listener to the "barChart" canvas for the "Windows" bar chart

//   var ctx = document.getElementById("pieChart").getContext("2d");
//   var pieChart = new Chart(ctx, {
//     type: "pie",
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           data: activityTimes,
//           backgroundColor: [
//             "rgba(255, 99,32, 0.8)",
//             "rgba(55, 99, 32, 0.8)",
//             "rgba(255, 199, 132, 0.8)",
//             "rgba(25, 99, 132, 0.8)",
//             "rgba(54, 162, 235, 0.8)",
//             "rgba(255, 206, 86, 0.8)",
//             "rgba(255, 26, 86, 0.8)",
//             // Add more colors for each label if needed
//           ],
//           borderColor: "black",
//           borderWidth: 1,
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: {
//           position: "top",
//         },
//         title: {
//           display: true,
//           text: "Total Time Spent on Windows",
//         },
//       },
//     },
//   });

//   // Store the original data for the "barChart" and "pieChart"
//   const originalBarChartData = {
//     labels: labels,
//     data: activityTimes,
//   };

//   const originalPieChartData = {
//     labels: labels,
//     data: activityTimes,
//   };

//   // Add an event listener to the "barChartUser" canvas
//   ctxUser.canvas.addEventListener("click", function (event) {
//     const activePoints = barChartUser.getElementsAtEventForMode(
//       event,
//       "nearest",
//       {
//         intersect: true,
//       }
//     );

//     if (activePoints.length > 0) {
//       const clickedIndex = activePoints[0].index;
//       const selectedUserID = userLabels[clickedIndex];
//       updateWindowCharts(selectedUserID);
//     }

    
//   });

  
  
//   // Function to update the window charts based on the selected user ID
//   function updateWindowCharts(selectedUserID) {
//     const userWindowsData = data.filter(
//       (item) => item[" User_ID "] === selectedUserID
//       );
      
//       const windowMap = new Map();
//       userWindowsData.forEach((item) => {
//         const windowName = item[" Activity_Window_Name "];
//         const activityTime = parseInt(item[" Activity_Window_Time "]);
//         if (windowMap.has(windowName)) {
//           windowMap.set(windowName, windowMap.get(windowName) + activityTime);
//         } else {
//           windowMap.set(windowName, activityTime);
//         }
//       });
      
//       const labels = Array.from(windowMap.keys());
//       const activityTimes = Array.from(windowMap.values()).map((sum) => sum);
      
//       // Update the data and labels for the "barChart"
//       barChart.data.labels = labels;
//       barChart.data.datasets[0].data = activityTimes;
//       barChart.update();
      
//       // Update the data and labels for the "pieChart"
//       pieChart.data.labels = labels;
//     pieChart.data.datasets[0].data = activityTimes;
//     pieChart.update();
//   }
  
  
  
//   ctx.canvas.addEventListener("click", function (event) {
//     const activePoints = barChart.getElementsAtEventForMode(event, "nearest", {
//       intersect: true,
//     });

//     if (activePoints.length > 0) {
//       const clickedIndex = activePoints[0].index;
//       const selectedWindowName = labels[clickedIndex]; // Use the window labels
//       updateUserCharts(selectedWindowName);
//     }
//   });
  
  
//   // Function to update the user charts based on the selected window name
//   function updateUserCharts(selectedWindowName) {
//     const windowUserData = data.filter(
//       (item) => item[" Activity_Window_Name "] === selectedWindowName
//     );
    
//     const userMap = new Map();
//     windowUserData.forEach((item) => {
//       const userID = item[" User_ID "];
//       const activityTime = parseInt(item[" Activity_Window_Time "]);
//       if (userMap.has(userID)) {
//         userMap.set(userID, userMap.get(userID) + activityTime);
//       } else {
//         userMap.set(userID, activityTime);
//       }
//     });

//     const userLabels = Array.from(userMap.keys());
//     const userActivityTimes = Array.from(userMap.values()).map((sum) => sum);

//     // Update the data and labels for the "barChartUser"
//     barChartUser.data.labels = userLabels;
//     barChartUser.data.datasets[0].data = userActivityTimes;
//     barChartUser.update();

//     // Update the data and labels for the "pieChartUser"
//     pieChartUser.data.labels = userLabels;
//     pieChartUser.data.datasets[0].data = userActivityTimes;
//     pieChartUser.update();
//   }
//   document.addEventListener("click", function (event) {
//     // Get the element that was clicked
//     const clickedElement = event.target;
  
//     // Check if the clicked element is a descendant of the bar chart canvases or their containers
//     const barChartCanvases = [ctxStacked.canvas, ctxUser.canvas, ctx.canvas];
//     const isDescendantOfBarChart = barChartCanvases.some((canvas) =>
//       canvas.contains(clickedElement)
//     );
  
//     // If the clicked element is not a descendant of the bar chart, reset the window charts
//     if (!isDescendantOfBarChart) {
//       resetWindowCharts();
//       resetUserCharts();
//     }
//   });

//     // Function to reset the window charts to the original state
//     function resetWindowCharts() {
//       barChart.data.labels = originalBarChartData.labels;
//       barChart.data.datasets[0].data = originalBarChartData.data;
//       barChart.update();
  
//       pieChart.data.labels = originalPieChartData.labels;
//       pieChart.data.datasets[0].data = originalPieChartData.data;
//       pieChart.update();
//     }

//   // Function to reset the user charts to the original state
//   function resetUserCharts() {
//     barChartUser.data.labels = userLabels;
//     barChartUser.data.datasets[0].data = userActivityTimes;
//     barChartUser.update();

//     pieChartUser.data.labels = userLabels;
//     pieChartUser.data.datasets[0].data = userActivityTimes;
//     pieChartUser.update();
//   }
// });



// function getRandomValue(max) {
//   return Math.floor(Math.random() * max);
// }
