#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>

#define NUM_PHILOSOPHERS 5

// Define semaphores for the forks and the mutex
sem_t forks[NUM_PHILOSOPHERS];
sem_t mutex;

bool isThinking[NUM_PHILOSOPHERS] = {true, true, true, true, true};

// Define the philosopher thread function
void *philosopher(void *arg)
{
    int index = *((int *)arg);
    while (1)
    {
        // printf("Philosopher %d is thinking...\n", index);
        isThinking[index] = true;
        sleep(2); // Thinking

        sem_wait(&mutex);

        int left_fork_index = index;
        int right_fork_index = (index + 1) % NUM_PHILOSOPHERS;

        sem_wait(&forks[left_fork_index]);
        sem_wait(&forks[right_fork_index]);

        sem_post(&mutex);

        printf("Philosopher %d is eating...\n", index);
        isThinking[index] = false;
        sleep(2); // Eating

        sem_post(&forks[left_fork_index]);
        sem_post(&forks[right_fork_index]);
    }
    return NULL;
}

// Function to print the state of each philosopher every 5 seconds
void *printStates(void *arg)
{
    while (1)
    {
        printf("\n");
        // Print the state of each philosopher
        for (int i = 0; i < NUM_PHILOSOPHERS; i++)
        {
            if (isThinking[i])
                printf("Philosopher %d is thinking...\n", i);
            else
                printf("Philosopher %d is eating...\n", i);
        }
        printf("\n");

        // Sleep for 5 seconds
        sleep(5);
    }
}

int main()
{
    srand(time(NULL));

    // Initialize semaphores
    for (int i = 0; i < NUM_PHILOSOPHERS; i++)
    {
        sem_init(&forks[i], 0, 1);
    }
    sem_init(&mutex, 0, 1);

    // Create a thread for each philosopher
    pthread_t philosopher_threads[NUM_PHILOSOPHERS];
    pthread_t print_thread;
    int philosopher_indices[NUM_PHILOSOPHERS];
    for (int i = 0; i < NUM_PHILOSOPHERS; i++)
    {
        philosopher_indices[i] = i;
        pthread_create(&philosopher_threads[i], NULL, philosopher, &philosopher_indices[i]);
    }

    // Create a thread for printing the states
    pthread_create(&print_thread, NULL, printStates, NULL);

    // Wait for the philosopher threads to complete
    for (int i = 0; i < NUM_PHILOSOPHERS; i++)
    {
        pthread_join(philosopher_threads[i], NULL);
    }

    // Destroy semaphores
    for (int i = 0; i < NUM_PHILOSOPHERS; i++)
    {
        sem_destroy(&forks[i]);
    }
    sem_destroy(&mutex);

    return 0;
}
