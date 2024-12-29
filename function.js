// Function to create randomized, playable combinations
function createGameCombinations(
  numColors,
  ballsPerContainer,
  numEmptyContainers
) {
  const balls = []
  const totalContainers =
    Math.ceil((numColors * ballsPerContainer) / ballsPerContainer) +
    numEmptyContainers;

  // Generate balls: e.g., ["red", "red", "blue", "blue", ...]
  const colors = ["red", "blue", "green", "yellow", "purple"];
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < ballsPerContainer; j++) {
      balls.push(colors[i]);
    }
  }

  // Shuffle the balls
  for (let i = balls.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [balls[i], balls[randomIndex]] = [balls[randomIndex], balls[i]];
  }

  // Distribute balls into containers
  const containers = [];
  for (let i = 0; i < totalContainers - numEmptyContainers; i++) {
    containers.push(balls.splice(0, ballsPerContainer));
  }

  // Add empty containers
  for (let i = 0; i < numEmptyContainers; i++) {
    containers.push([]);
  }

  return containers;
}

const numColors = 3
const ballsPerContainer = 4
const numEmptyContainers = 1

const gameState = {
    containers: createGameCombinations(numColors,ballsPerContainer,numEmptyContainers)
};

function createLayout() {
  gameState.containers.forEach(stack => {
    let ballStack = '';
    
    stack.forEach(ballColor => {
      const color = `background: radial-gradient(circle at 30% 30%, #ffffff, ${ballColor}, ${ballColor}), 
                repeating-radial-gradient(circle, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 5px, transparent 10px);`;
      ballStack += `<div class="rounded-circle ball" style="${color}" data-color=${ballColor}></div>`
    })
  
    const ballStackContainer = `<div class="ballStackContainer m-3 pb-1">${ballStack}</div>`
    $('#balls-wrapper').append(ballStackContainer)
  
    $('.ballStackContainer').height(ballsPerContainer*$('.ball').height()+10+'px')
  })

  $('.ballStackContainer').on('click', function() {
    if (selectedBall && selectedStack) {
      return
    }
    if (!selectedBall) {
      const ball = $(this)
        .children("[data-color]:not([data-color='transparent'])")
        .first();
      selectedBall = ball;
      selectedColor = $(ball).data('color')
      ballClone = selectedBall.clone();
      ballJumpUp()
    } else {
      selectedStack = $(this);
      if (selectedBall.parent()[0] === selectedStack[0]) {
        ballDropBack();
        return
      }
      const stackEmpty = $(this).children().length === 0;
      const emptySpace = $(this).children().length < ballsPerContainer;
      const colorMatches = $(this).children().first().data('color') === selectedColor;
      if (stackEmpty || (emptySpace && colorMatches)) {
        ballMove();
      } else {
        ballDropBack();
      }
    }
  })  

  $('#level').text(localStorage.getItem('level') || 1)
}

createLayout();

let selectedBall = null;
let selectedColor = null;
let selectedStack = null;
let ballClone = null;

function ballJumpUp() {
  $('body').append(ballClone);
  $(selectedBall).css('visibility', 'hidden')
  ballClone.css({
    position: 'absolute',
    top: selectedBall.offset().top,
    left: selectedBall.offset().left
  }).animate({
    top: `-=${2*$(ballClone).height()}` 
  }, 200, 'swing');
}

function ballMove() {
  const target = $(selectedStack);
  ballClone.animate({
    top: target.offset().top - 2*$(ballClone).height(),
    left: target.offset().left
  }, 400, function () {
    selectedBall.appendTo(target);
    $(selectedBall).css('visibility', 'visible')
    ballClone.remove();
    resetSelection();
    isGameFinished();
  });
}

function ballDropBack() {
  ballClone.animate({
    top: selectedBall.offset().top,
    left: selectedBall.offset().left
  }, 200, 'swing', function() {
    $(selectedBall).css('visibility', 'visible')
    ballClone.remove();
    resetSelection()
  });
}

function resetSelection() {
  selectedBall = null;
  selectedColor = null;
  selectedStack = null;
  ballClone = null;
}

function reset() {
  $('#balls-wrapper').empty();
  createLayout();
}

function isGameFinished() {
  const allFilled = $('.ballStackContainer').filter(function() {
    return $(this).children().length === 0;
  }).length === numEmptyContainers; 

  let colorsMatched = true;

  $('.ballStackContainer').each(function() {
    const $children = $(this).children(); 
    if ($children.length !== 0) {
      const firstColor = $children.first().data('color'); 
      const allSameColor = $children.toArray().every(child => $(child).data('color') === firstColor);
      if (!allSameColor) {
        colorsMatched = false;
      }
    }
  });
  
  if (allFilled && colorsMatched) {
    $('#balls-wrapper').addClass('blur-effect');
    setTimeout(() => {
      $('#balls-wrapper').empty();
      $('#balls-wrapper').removeClass('blur-effect');

      let level = localStorage.getItem('level');
      if (level) {
        localStorage.setItem('level', level + 1);
      } else {
        localStorage.setItem('level', 2);
      }
      createLayout();
    }, 3000);
  }
}


