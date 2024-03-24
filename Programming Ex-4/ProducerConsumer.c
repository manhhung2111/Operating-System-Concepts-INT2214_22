#include <stdio.h>
#include <pthread.h>
#include <semaphore.h>
#include <unistd.h>

#define BUFFER_SIZE 10

// The data type representing a semaphore in "semaphore.h".
// It's a structure containing the necessary data to manage the semaphore.
sem_t empty, full, mutex;

int buffer[BUFFER_SIZE];
int in = 0, out = 0;

void *producer(void *arg)
{
    int item;
    for (int i = 0; i < 21; i++)
    {
        item = i;
        sem_wait(&empty);
        sem_wait(&mutex); 

        // add produced item to buffer
        buffer[in] = item;
        printf("Producer produces item %d\n", item);
        in = (in + 1) % BUFFER_SIZE;

        sem_post(&mutex);
        sem_post(&full); 
        // sleep(1); // Simulate some work done by producer
    }
    pthread_exit(NULL);
}

void *consumer(void *arg)
{
    int item;
    for (int i = 0; i < 21; i++)
    {
        sem_wait(&full);
        sem_wait(&mutex);

        // consume item produced by producer
        item = buffer[out];
        printf("Consumer consumes item %d\n", item);
        out = (out + 1) % BUFFER_SIZE;

        sem_post(&mutex);
        sem_post(&empty);
        // sleep(2); // Simulate some work done by consumer
    }
    pthread_exit(NULL);
}

int main()
{
    pthread_t producer_thread, consumer_thread;
    sem_init(&empty, 0, BUFFER_SIZE);
    sem_init(&full, 0, 0);
    sem_init(&mutex, 0, 1);

    pthread_create(&producer_thread, NULL, producer, NULL);
    pthread_create(&consumer_thread, NULL, consumer, NULL);

    pthread_join(consumer_thread, NULL);
    pthread_join(producer_thread, NULL);

    sem_destroy(&empty);
    sem_destroy(&full);
    sem_destroy(&mutex);

    return 0;
}

/**
 * `sem_wait`This function is used to decrement (wait on) the semaphore. 
 * If the semaphore's value is greater than 0, it decrements the value and continues execution. 
 * If the value is 0, the function blocks until the semaphore's value becomes greater than 0.
 * 
 * `sem_post`: This function is used to increment (signal) the semaphore. 
 * It increments the semaphore's value and wakes up any threads waiting on the semaphore, allowing them to proceed.
 */