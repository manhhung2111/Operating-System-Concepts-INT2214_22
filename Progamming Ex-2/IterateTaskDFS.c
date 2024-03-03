#include <linux/sched.h>

#include <linux/init.h>

#include <linux/kernel.h>

#include <linux/module.h>

void dfs(struct task_struct *task)
{

    struct task_struct *child; // Pointer to the next child

    struct list_head *list; // Children

    // task->comm is the task' name

    // task->state is the task's state (-1 unrunnable, 0 runnable, >0 stopped)

    // task->pid is the task's process ID

    printk(KERN_INFO "Name: %-20s State: %ld\tProcess ID: %d\n", task->comm, task->state, task->pid);

    list_for_each(list, &task->children)
    { // Loop over children

        child = list_entry(list, struct task_struct, sibling); // Get child

        /* child points to the next child in the list */

        dfs(child); // DFS from child
    }
}

/* This function is called when the module is loaded. */

int init(void)
{

    printk(KERN_INFO "Inserting module\n");

    dfs(&init_task); // DFS starting init_task

    return 0;
}

/* This function is called when the module is removed. */

void exit(void)
{

    printk(KERN_INFO "Removing module\n");
}

/* Macros for registering module entry and exit points. */

module_init(init);

module_exit(exit);

MODULE_LICENSE("GPL");

MODULE_DESCRIPTION("List tasks using DFS");

MODULE_AUTHOR("SGG");