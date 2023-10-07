# README #

## How-To-Run Instructions

First time running

```term
npm i
```

Start Game

```term
npm start
```

## Description

This is a climbing simulator game where the goal is to reach the top of the cliff.

The game consists of rounds where the player must choose a direction to move towards (L,M,R).

The player will receive in the terminal string representations of the climbing wall (up to 3 at time)

The player tries to move in the safest direction to maximize there chance of progressing.

Players will try to minimize the distance of their next grabbable hold (ex: 'o')

Ungrabbable holds appear as dashes (-).

The game has at least 10 levels before completion

Example wall:

``` term
- - - - o - - - -
- - o - - - - - -
- o - - - - - - -
- - - - - - - - -
- o - - - - - - -
o - - - - - - - -
- - o - - - - - -
- o - - - - - - -
- o - - - - - - -
```

If a player uses their right hand to grab a hold, then there left hand's default position is one slot to the left

A hand that contains a hold is represented in uppercase (ex: L)

A hand that does not contain a hold is seen in lowercase (ex: l)

Example:

Player grabs the hold with their right hand

``` term
- o => l R
```

The left hand can only grab holds less than or equal to 'REACH_DISTANCE' number of slots away

Example of a valid reach (where REACH_DISTANCE == 4)

``` term
- o -       - L r
- - -  ==>  - - -
l R -       - o -
```

The distance between R and L is sqrt(3^2 + 1^2)

TODO: Handle user input and game states

How to track user's hands on the wall?

Method of input? ex: L13

            1: - - o - - - - - -
            2: - - L - - - - - -

Show the next set of layers only when the user reaches the top-most visible layer

Should the game end automatically when no valid moves are available?

OR, should we implement quick-time events for out of distance holds

           ex: --*---( )--- ❌
           ex: ------(*)--- ✅
 
Should we allow players to swap hands for the same hold?

           1: - - - L - -
           2: - - - R - -
