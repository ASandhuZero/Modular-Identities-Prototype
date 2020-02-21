using UnityEngine;
using System.Collections;
using System.Threading;
using System;

public class RunProxy : MonoBehaviour {

    CiFProxy proxy;
	// Use this for initialization
	void Start () {
        proxy = new CiFProxy();
        Thread pThread = new Thread(new ThreadStart(proxy.Proxy));
        pThread.Start();
     
        //proxy.Proxy();
        Debug.Log("This is running");
	}
	
	// Update is called once per frame
	void Update () {

    }
}
