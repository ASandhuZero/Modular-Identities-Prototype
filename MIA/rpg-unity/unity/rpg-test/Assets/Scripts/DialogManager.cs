using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using System.Xml;
using System.IO;

// A delegate type for hooking up notifications.

public class DialogManager : MonoBehaviour {

	public static bool isTalking = false;
	public GameObject buttonPanel;
	public float talkDistance = 0.45f;
	public GameObject prefabButton;
	public GameObject dialogueUI;
	public GameObject player;
	public GameObject dimmer;
	enum Modes {Practice=0, Action, Dialogue};
	enum Talker {Initiator=0, Responder};
	static int talkingMode = (int)Modes.Practice;
	static int whosTalking = (int)Talker.Initiator; 
	static string responder;
	List<string> dialogueText;
	int currentlyDisplayingText = 0;


	// Use this for initialization
	void Start () {
		buttonPanel.SetActive (false);
		dialogueUI.SetActive (false);
	}

	// Update is called once per frame
	void Update () {

		if (Input.GetKeyDown (KeyCode.Space)) {
			GameCharacter closestCharacter = null;
			float closestDistance = 99999999f;
			Vector3 movement_vector3D = PlayerMovement.movement_vector3D;

			foreach (GameCharacter character in GameManager.characterList) {
				Vector3 distance_vector = character.transform.position - player.transform.position;
				distance_vector.z = 0;
				
				float angleBetween = Mathf.Abs (Vector3.Angle (movement_vector3D, distance_vector));
				if (angleBetween < 80) {
					if (distance_vector.magnitude < closestDistance) {
						closestDistance = distance_vector.magnitude;
						closestCharacter = character;
					}
				}
			}
			Debug.Log ("closestDistance = " + closestDistance);
			Debug.Log ("closestCharacter = " + closestCharacter);
			responder = closestCharacter.name;
			if (talkingMode == (int)Modes.Practice && closestDistance < talkDistance && closestCharacter != null) {
				isTalking = !isTalking;

				Debug.Log ("talking to " + closestCharacter.gameObject.name + "! yay!");

				// TODO: Hook up to CiF
				// start in Practice mode - show selection of buttons for which practice the player wants to choose
				// After a practice is chosen, move to Action mode - selection of buttons for which action the player wants to choose
				// After an action is chosen, move to Dialog mode - player clicks through dialog exchange
				// When Dialog is over, return to Action mode unless no actions are available in which case exit
				// TODO: Should loop back to practices with a Leave option
				// TODO: Mixture of mouse and keyboard is annoying. Make both work or just require one to get through whole interaction
				if (isTalking) {
					if (talkingMode == (int)Modes.Practice)
					{
						// set the initiator
						CiFProxy.SendMessage("SetInitiator player");
						StartCoroutine (SetupResponder ());

					//	List<String> practiceList = CiFProxy.outerMessage ("Get Practices");
					//	Debug.Log (practiceList);
						// Choosing a practice, show button panel and list out practices

					}
				}
				if (!isTalking) {
					DestroyChildren(buttonPanel.transform);
					buttonPanel.SetActive(false);
					dialogueUI.SetActive(false);
					dimmer.SetActive (false);
					talkingMode = (int)Modes.Practice;
				}
			}
			else if (talkingMode == (int)Modes.Dialogue)
			{
				SkipToNextText();
			}
			

		}
	}

	//This is a function for a button you press to skip to the next text
	void SkipToNextText(){
		StopAllCoroutines();
		currentlyDisplayingText++;
		whosTalking = (whosTalking + 1) % Talker.GetNames(typeof(Talker)).Length;
		SetTalker (whosTalking);
		//If we've reached the end of the array, do anything you want. I just restart the example text
		if (currentlyDisplayingText>=dialogueText.Count) {
			currentlyDisplayingText=0;
			CiFProxy.SendMessage("IsTerminalStage");
			StartCoroutine (TestTerminal ());
			return;
		}
		StartCoroutine(AnimateText());
	}

	private IEnumerator GetPracticeNames()
	{
		while (!CiFProxy.serverReturned)
			yield return null;
		CiFProxy.serverReturned = false;

		// get list of practices
		CiFProxy.SendMessage("GetPracticeNames");
		StartCoroutine(CreatePracticeMenu());
		dimmer.SetActive(true);
		buttonPanel.SetActive(true);
		// clear any practices from last time
		DestroyChildren (buttonPanel.transform);

	}

	private IEnumerator SetupResponder()
	{
		while (!CiFProxy.serverReturned)
			yield return null;
		CiFProxy.serverReturned = false;

		CiFProxy.SendMessage ("SetResponder " + responder);
		StartCoroutine (GetPracticeNames ());
	}

	private IEnumerator CreateActionChoiceMenu()
	{
		talkingMode = (int)Modes.Action;

		while(!CiFProxy.serverReturned) yield return null;

		// TODO: This is so not the safe way to do this stuff I'm guessing
		// Josh probably has ideas of how to make this more robust and awesome
		CiFProxy.serverReturned = false;

		// Create list of available actions based on what is returned from CiF
		for (int i=0; i < CiFProxy.actionNamesList.names.Count; i++) {
			// for every action, instantiate a button and attach it to the panel
			String buttonLabel = CiFProxy.actionNamesList.names [i];
			GameObject buttonObj = Instantiate(prefabButton);
			buttonObj.transform.SetParent(buttonPanel.transform, false);

			// update the label of the button to be the name of the action
			buttonObj.GetComponentInChildren<Text>().text = buttonLabel;

			// add a listener for when an action is chosen
			buttonObj.GetComponent<Button>().onClick.AddListener(
				() => {
					// get info on which button was selected
					GameObject buttonSelected = EventSystem.current.currentSelectedGameObject;
					string buttonText = buttonSelected.GetComponentInChildren<Text>().text;

					// send the action that was chosen to CiF
					CiFProxy.SendMessage("SetAction " + buttonText);
					//Remove action selection buttons
					DestroyChildren(buttonPanel.transform);
					buttonPanel.SetActive (false);

					//once an action is chosen, deal with dialogue and such
					StartCoroutine(LaunchPractice());				
				}
			);
		}
	}

	private IEnumerator PracticeSet()
	{
		while (!CiFProxy.serverReturned)
			yield return null;

		CiFProxy.serverReturned = false;
		CiFProxy.SendMessage("GetActionNames");

		//Choose actions menu
		StartCoroutine(CreateActionChoiceMenu());
	}

	private IEnumerator CreatePracticeMenu() 
	{
		while(!CiFProxy.serverReturned) yield return null;

		// TODO: This is so not the safe way to do this stuff I'm guessing
		// Josh probably has ideas of how to make this more robust and awesome
		CiFProxy.serverReturned = false;

		for (int i=0; i < CiFProxy.practiceNamesList.names.Count; i++) {
			String buttonLabel = CiFProxy.practiceNamesList.names [i];
			GameObject buttonObj = Instantiate(prefabButton);
			buttonObj.transform.SetParent(buttonPanel.transform, false);

			buttonObj.GetComponentInChildren<Text>().text = buttonLabel;
			buttonObj.GetComponent<Button>().onClick.AddListener(
				() => {
					GameObject buttonSelected = EventSystem.current.currentSelectedGameObject;
					string buttonText = buttonSelected.GetComponentInChildren<Text>().text;
					CiFProxy.SendMessage("SetPractice " + buttonText);
					//Remove practice selection buttons
					DestroyChildren(buttonPanel.transform);
					StartCoroutine(PracticeSet());
				}
			);
		}

	}

	private IEnumerator TestTerminal()
	{
		while (!CiFProxy.serverReturned)
			yield return null;

		dialogueUI.SetActive (false);

		CiFProxy.serverReturned = false;
		if (!CiFProxy.curStage.isTerminal) {
			buttonPanel.SetActive (true);
			// clear any actions from last time
			DestroyChildren (buttonPanel.transform);

			CiFProxy.SendMessage ("GetActionNames");
			StartCoroutine (CreateActionChoiceMenu ());
		} else {
			dimmer.SetActive (false);
			isTalking = false;
			talkingMode = (int)Modes.Practice;
		}
			
	}

	private IEnumerator SetupDialogue()
	{
		while (!CiFProxy.serverReturned)
			yield return null;
		
		CiFProxy.serverReturned = false;
		dialogueText = CiFProxy.actionDialogue.dialogue;

		for (int i = 0; i < dialogueText.Count; i++) {
			dialogueText [i] = "<document>" + dialogueText [i] + "</document>";
			using (XmlReader reader = XmlReader.Create (new StringReader (dialogueText[i]))) {
				reader.ReadToFollowing ("line");
				dialogueText[i] = reader.ReadElementContentAsString ();
			}
		}
		//Change UI to conversation mode
		dialogueUI.SetActive (true);
		// initiator always starts the conversation
		whosTalking = (int)Talker.Initiator;
		SetTalker (whosTalking);
		StartCoroutine(AnimateText());

	}

	private IEnumerator LaunchPractice()
	{
		while (!CiFProxy.serverReturned)
			yield return null;

		CiFProxy.serverReturned = false;

		talkingMode = (int)Modes.Dialogue;
		CiFProxy.SendMessage ("GetDialogue");
		StartCoroutine (SetupDialogue ());

	}

	// Show the appropriate portrait based on who is talking
	void SetTalker(int role)
	{
		// show image on left side if initiator
		// otherwise show image on right side if responder
		// TODO: Eventually we'll need which image, not just what role
		if (role == (int)Talker.Initiator) {
			// show left side image
			dialogueUI.transform.Find("LeftProtraitPanel").gameObject.SetActive(true);
			// hide right side image
			dialogueUI.transform.Find("RightProtraitPanel").gameObject.SetActive(false);
			// set text
			dialogueUI.transform.Find("SpeakerPanel").gameObject.GetComponentInChildren<Text>().text = "Player";

		} else {
			// hide left side image
			dialogueUI.transform.Find("LeftProtraitPanel").gameObject.SetActive(false);
			// show right side image
			dialogueUI.transform.Find("RightProtraitPanel").gameObject.SetActive(true);
			// set text
			dialogueUI.transform.Find("SpeakerPanel").gameObject.GetComponentInChildren<Text>().text = responder;
		}
	}

	//Note that the speed you want the typewriter effect to be going at is the yield waitforseconds 
	//(in my case it's 1 letter for every 0.01 seconds, replace this with a public float if you want to 
	//experiment with speed in from the editor)
	IEnumerator AnimateText(){
		
		for (int i = 0; i < (dialogueText[currentlyDisplayingText].Length+1); i++)
		{
			dialogueUI.GetComponentInChildren<Text>().text = dialogueText[currentlyDisplayingText].Substring(0, i);
			yield return new WaitForSeconds(.01f);
		}

	}

	/// <summary>
	/// Calls GameObject.Destroy on all children of transform. and immediately detaches the children
	/// from transform so after this call tranform.childCount is zero.
	/// </summary>
	void DestroyChildren(Transform transform) {
		for (int i = transform.childCount - 1; i >= 0; --i) {
			GameObject.Destroy(transform.GetChild(i).gameObject);
		}
		transform.DetachChildren();
	}

}
