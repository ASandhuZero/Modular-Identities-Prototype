# Ensemble Assignment

You goal is to make a character-centric interactive short story using CiF/Ensemble. The output can be textual, graphical, or a blend (see the *Lovers and Rivals* example project). The project in the graded folder of the master branch will be assessed. 

## Repository Structure ##

* *doc* - The documentation that includes a description of the cif.js API and a guided tour on how to set up a project.
* *exampleSchemata* - Examples of authored content.
* *graded* - This is where you should put your project.
* *sampleEmptyProject* - A skeleton project that could be a useful base for your work.
* *sampleGame* - Contains a demo game called "Lovers and Rivals"

## Constraints ##

Your experience must include at least the following:
* 4 characters
* 20 volition rules
* 8 actions
* 5 trigger rules
* Schema with:
  * Directed values
  * Undirected values
  * Intents
  * Numeric values
  * Boolean values
  * Single turn values

## Running Projects ##

To run the projects or to view the documentation, start a local web server. Python has a built-in web server you can use via the following command to serve the directory in which the command was issued:

`python -m http.server`
  
Alternatively, you can [Apache's web server](https://httpd.apache.org/).

## The Authoring Tool ##

You should use the [authoring tool](https://drive.google.com/file/d/1JtcNVgAVBZqJ-rnM90LlEBDxU6psMsr5/view?usp=sharing) to create most of the AI system content for your experience. The exceptions are the schema, cast, and action files which should be edited with a plain text editor that has JSON syntax support.
