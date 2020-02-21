using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class PlayerMovement : MonoBehaviour {

	Rigidbody2D rbody;
	Animator anim;
	public static Vector3 movement_vector3D; // set by code
	bool talking;
	// Use this for initialization
	void Start () {
		//DialogManager targetScript = GameObject.Find ("ScriptHome").GetComponent<DialogManager>();
		rbody = GetComponent<Rigidbody2D> ();
		anim = GetComponent<Animator> ();
	}

	// Update is called once per frame
	void Update () {
		Vector2 movement_vector = new Vector2 (Input.GetAxisRaw ("Horizontal"), Input.GetAxisRaw ("Vertical"));
		talking = DialogManager.isTalking;

		if (movement_vector != Vector2.zero && !talking) {
			anim.SetBool ("is_walking", true);
			anim.SetFloat("input_x", movement_vector.x);
			anim.SetFloat ("input_y", movement_vector.y);
			movement_vector3D = new Vector3 (movement_vector.x, movement_vector.y, 0);
		} else {
			anim.SetBool ("is_walking", false);
		}

		if (!talking)
			rbody.MovePosition (rbody.position + movement_vector * Time.deltaTime);

		//		distance_vector = duder.transform.position - transform.position;
		Debug.DrawLine (transform.position, transform.position + movement_vector3D * 2);

	}
}
