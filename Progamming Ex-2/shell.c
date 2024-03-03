#include <stdio.h>

#include <stdlib.h>

#include <string.h>

#include <unistd.h>

#include <sys/types.h>

#include <wait.h>

#define MAX_LINE 80 /* 80 chars per command, per command */

char history[10][MAX_LINE]; // an array to store history commands

int numCommands = 0; // keep track of number of commands

void showHist()

{

    int n = numCommands > 10 ? 10 : numCommands;

    for (int i = 0; i < n; i++)

    {

        // print # and command (from the most to least recent command)

        printf("%d.  ", n - i);

        for (int j = 0; history[i][j] != '\n' && history[i][j] != '\0'; j++)

        {

            printf("%c", history[i][j]);
        }

        printf("\n");
    }
}

void readUserCommand(char command[], char *args[], int *background)

{

    // Read the input from the command line

    if (fgets(command, MAX_LINE, stdin) == NULL)

    {

        perror("fgets failed");

        exit(1);
    }

    // Remove the newline character

    size_t length = strlen(command);

    if (command[length - 1] == '\n')

    {

        command[length - 1] = '\0';
    }

    // Parse the input into tokens

    char *token = strtok(command, " ");

    int i = 0;

    while (token != NULL)

    {

        args[i++] = token;

        token = strtok(NULL, " ");
    }

    // Check for background execution

    if (i > 0 && strcmp(args[i - 1], "&") == 0)

    {

        *background = 1;

        args[--i] = NULL;
    }

    else

    {

        args[i] = NULL;
    }

    // check to see if user inputed the history command and if there is a command history

    if (strcmp(args[0], "history") == 0)

    {

        if (numCommands > 0)

        {

            showHist();
        }

        else

        {

            printf("\nNo commands in history.\n");
        }

        return;
    }

    else if (**args == '!') // Check to see if '!' is inputed, then retrieve appropriate command

    {

        if (args[0][1] == '!')

        {

            // execute the most recent command

            strcpy(command, history[0]);

            char *token = strtok(command, " ");

            int i = 0;

            while (token != NULL)

            {

                args[i++] = token;

                token = strtok(NULL, " ");
            }

            // Check for background execution

            if (i > 0 && strcmp(args[i - 1], "&") == 0)

            {

                *background = 1;

                args[--i] = NULL;
            }

            else

            {

                args[i] = NULL;
            }
        }

        else

        {

            int is2Digit = args[0][2] == 0 ? 0 : 1;

            int histCommand = (args[0][1] - '0') * (is2Digit ? 10 : 1) + (is2Digit ? (args[0][2] - '0') : 0);

            if (histCommand > numCommands || histCommand == 0)

            {

                printf("\nNo such command in history.\n");

                strcpy(command, "Invalid command");
            }

            else

            { // valid !n

                strcpy(command, history[numCommands - histCommand]);
            }
        }
    }

    // update history

    for (int i = 9; i > 0; i--)

        strcpy(history[i], history[i - 1]);

    strcpy(history[0], command);

    numCommands++;

    numCommands = numCommands > 10 ? 10 : numCommands;
}

int main(void)

{

    /**

     * After reading user input, the steps are:

     * (1) fork a child process

     * (2) the child process will invoke execvp()

     * (3) if command included &, parent will invoke wait()

     */

    char *args[MAX_LINE / 2 + 1]; /* command command arguments */

    int should_run = 1; /* flag to determine when to exit program */

    char command[MAX_LINE]; /* the input command */

    pid_t pid;

    int background; /* flag for background execution */

    while (should_run)

    {

        background = 0;

        printf("osh> ");

        fflush(stdout);

        readUserCommand(command, args, &background);

        // Fork a child process

        pid = fork();

        if (pid < 0)

        {

            perror("Fork failed");

            exit(1);
        }

        if (pid == 0)

        { // Child process

            // Execute the command

            if (strcmp(command, "history") == 0)
                continue;

            if (execvp(args[0], args) == -1)

            {

                perror("execvp failed");

                exit(1);
            }
        }

        else

        { // Parent process

            if (!background)

            {

                // Wait for the child process to exit

                waitpid(pid, NULL, 0);
            }
        }

        // Check if the user wants to exit the program

        if (strcmp(args[0], "exit") == 0)

        {

            should_run = 0;
        }
    }

    return 0;
}