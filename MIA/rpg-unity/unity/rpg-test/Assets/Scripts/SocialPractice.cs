using System;
using System.Collections;
using System.Collections.Generic;

[Serializable]
public class SubjectCondition
{
	public string @class;
	public string type;
	public string first;
	public string second;
	public bool value;
}

[Serializable]
public class EntryStage
{
	public bool eventStage;
	public string label;
	public List<string> nextStages;
	public List<string> parentStages;
	public List<object> preconditions;
	public List<object> actions;
}

[Serializable]
public class Action
{
	public string label;
	public string intent;
	public int defaultWeight;
	public List<object> preconditions;
	public List<object> carryRules;
	public List<object> nowRules;
	public List<object> effects;
	public string performance;
	public object performanceTree;
}

[Serializable]
public class Stage
{
	public string label;
	public bool eventStage;
	public List<object> nextStages;
	public List<object> parentStages;
	public List<Action> actions;
	public bool entryStage;
}

[Serializable]
public class Practice
{
	public string label;
	//public List<SubjectCondition> subjectConditions { get; set; }
	public EntryStage entryStage;
	public List<Stage> stages;
	public List<Stage> eventStages;
	public List<object> actionContexts;
}

[Serializable]
public class PracticeList
{
	public List<Practice> practices;
}

[Serializable]
public class SocialPractice
{
	public Practice practice;
}
	
