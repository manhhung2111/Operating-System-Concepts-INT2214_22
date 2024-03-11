#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdbool.h>

/**
 * The structure of philosopher i:
 * while(true) {
 *  wait(chopstick[i])
 *  wait(chopstck[(i + 1) % 5])
 *
 *  Eat for a while
 *
 *  signal(chopstick[i])
 *  signal(chopstick[(i + 1) % 5])
 *
 * }
 * The problem with the above solution:
 * - deadlocks:multiple philosopher acquire forks -> each philosopher has to wait for a fork held by another philosopher
 * -> Solution: allow only 1 philosopher acquire forks at the same time by using mutex semaphore
 */

#define NUM_PHILOSOPHERS 5

// Define semaphores for the forks and the mutex
sem_t forks[NUM_PHILOSOPHERS];
sem_t mutex;

bool isThinking[NUM_PHILOSOPHERS] = {true};

// Define the philosopher thread function
void *philosopher(void *arg)
{
    int index = *((int *)arg);
    while (1)
    {
        sem_wait(&mutex);

        int left_fork_index = index;
        int right_fork_index = (index + 1) % NUM_PHILOSOPHERS;

        sem_wait(&forks[left_fork_index]);
        sem_wait(&forks[right_fork_index]);

        // Eating for a while
        isThinking[index] = false;
        sleep(rand() % 5 + 1);
        sem_post(&mutex);

        sem_post(&forks[left_fork_index]);
        sem_post(&forks[right_fork_index]);

        // Thinking for a while
        isThinking[index] = true;
        sleep(rand() % 5 + 1);
    }
    return NULL;
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
    int philosopher_indices[NUM_PHILOSOPHERS];
    for (int i = 0; i < NUM_PHILOSOPHERS; i++)
    {
        philosopher_indices[i] = i;
        pthread_create(&philosopher_threads[i], NULL, philosopher, &philosopher_indices[i]);
    }

    // Print the state of philosophers every 5 seconds
    while (1)
    {
        sleep(5);
        printf("\nCurrent state of philosophers:\n");
        for (int i = 0; i < NUM_PHILOSOPHERS; i++)
        {
            const char *state = isThinking[i] ? "thinking" : "eating";
            printf("Philosopher %d is %s\n", i, state);
        }
    }

    // Wait for the philosopher threads to complete (never reached)
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
