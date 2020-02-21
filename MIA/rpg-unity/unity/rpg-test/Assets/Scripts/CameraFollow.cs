using UnityEngine;
using System.Collections;

public class CameraFollow : MonoBehaviour {

	public Transform target;
	public float speed = 0.1f;
	Camera mycam;

	public float howManyGameWorldPixelsInHeight = 160;

	// Use this for initialization
	void Start () {
		mycam = GetComponent<Camera> ();
	
	}
	
	// Update is called once per frame
	void Update () {
		
		//(64 Tiled pixels to 1 Unity unit)
		float convertToUnityWorldUnits = howManyGameWorldPixelsInHeight / 64;
		//orthographicSize is the half height of the camera in the world
		mycam.orthographicSize = convertToUnityWorldUnits / 2;

		if (target) {
			transform.position = Vector3.Lerp(transform.position, target.position, speed) + new Vector3 (0, 0, -10);
		}
	}
}
